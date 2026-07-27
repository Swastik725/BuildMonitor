import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { randomBytes } from 'crypto';
import { Visibility } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ConnectRepositoryDto } from './dto/connect-repository.dto';

type GitHubRepositoryResponse = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  clone_url: string;
  default_branch: string;
  private: boolean;
  description?: string | null;
  owner: { login: string };
};

type GitHubCommitResponse = Array<{
  sha: string;
  commit: {
    message: string;
    author?: {
      name?: string | null;
      date?: string | null;
    } | null;
  };
}>;

type RepositoryConnectionInput = {
  owner: string;
  repo: string;
};

@Injectable()
export class RepositoriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Prefers the connecting user's own GitHub OAuth token (so listing/reading
   * repos reflects what THEY actually have access to) and falls back to the
   * shared env token (used for the actions:write scope needed to trigger
   * deployments, which the login scope doesn't grant).
   */
  private async getUserGithubToken(userId: string): Promise<string | undefined> {
    const authProvider = await this.prisma.authProvider.findFirst({
      where: { userId, provider: 'github' },
      select: { accessToken: true },
    });

    return authProvider?.accessToken ?? undefined;
  }

  private githubHeaders(token?: string) {
    const accessToken = token ?? process.env.GITHUB_TOKEN;

    return {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'BuildMonitor',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };
  }

  /** Lists every repo the connected GitHub account actually has access to. */
  async listAvailable(userId: string) {
    const token = await this.getUserGithubToken(userId);
    if (!token) {
      throw new BadRequestException(
        'Sign in with GitHub first to list your repositories',
      );
    }

    const response = await axios.get<GitHubRepositoryResponse[]>(
      'https://api.github.com/user/repos',
      {
        headers: this.githubHeaders(token),
        params: {
          per_page: 100,
          sort: 'updated',
          affiliation: 'owner,collaborator,organization_member',
        },
      },
    );

    return response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      htmlUrl: repo.html_url,
      defaultBranch: repo.default_branch,
      private: repo.private,
      description: repo.description ?? null,
    }));
  }

  private parseRepositoryReference(repository: string): RepositoryConnectionInput {
    const trimmed = repository.trim();
    if (!trimmed) {
      throw new BadRequestException('Repository is required');
    }

    const githubUrlMatch = trimmed.match(
      /^https?:\/\/github\.com\/([^/]+)\/([^/.]+)(?:\.git)?\/?$/i,
    );
    if (githubUrlMatch) {
      return {
        owner: githubUrlMatch[1],
        repo: githubUrlMatch[2],
      };
    }

    const sshMatch = trimmed.match(/^git@github\.com:([^/]+)\/([^/.]+)(?:\.git)?$/i);
    if (sshMatch) {
      return {
        owner: sshMatch[1],
        repo: sshMatch[2],
      };
    }

    const simpleMatch = trimmed.match(/^([^/]+)\/([^/]+)$/);
    if (simpleMatch) {
      return {
        owner: simpleMatch[1],
        repo: simpleMatch[2],
      };
    }

    throw new BadRequestException(
      'Repository must be owner/repo, a GitHub HTTPS URL, or a GitHub SSH URL',
    );
  }

  private async fetchRepository(owner: string, repo: string, token?: string) {
    const response = await axios.get<GitHubRepositoryResponse>(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: this.githubHeaders(token),
      },
    );

    return response.data;
  }

  private async fetchLatestCommit(owner: string, repo: string, branch: string, token?: string) {
    const response = await axios.get<GitHubCommitResponse>(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        headers: this.githubHeaders(token),
        params: {
          sha: branch,
          per_page: 1,
        },
      },
    );

    return response.data[0] ?? null;
  }

  private async ensureProjectAccess(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        organization: {
          members: {
            some: { userId },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }

  async findOne(projectId: string, userId: string) {
    await this.ensureProjectAccess(projectId, userId);

    return this.prisma.repository.findUnique({
      where: { projectId },
    });
  }

  async connect(projectId: string, userId: string, dto: ConnectRepositoryDto) {
    await this.ensureProjectAccess(projectId, userId);

    const token = await this.getUserGithubToken(userId);
    const { owner, repo } = this.parseRepositoryReference(dto.repository);
    const remote = await this.fetchRepository(owner, repo, token);
    const latestCommit = await this.fetchLatestCommit(
      remote.owner.login,
      remote.name,
      remote.default_branch,
      token,
    );

    const payload = {
      projectId,
      githubRepositoryId: String(remote.id),
      githubOwner: remote.owner.login,
      repositoryName: remote.name,
      cloneUrl: remote.clone_url,
      htmlUrl: remote.html_url,
      defaultBranch: remote.default_branch,
      visibility: remote.private ? Visibility.PRIVATE : Visibility.PUBLIC,
      webhookSecret: cryptoRandomSecret(),
      workflowFile: dto.workflowFile || 'deploy.yml',
      isConnected: true,
      lastSync: new Date(),
      latestCommitSha: latestCommit?.sha ?? null,
      latestCommitMessage: latestCommit?.commit.message ?? null,
      latestCommitAuthor: latestCommit?.commit.author?.name ?? null,
      latestCommitDate: latestCommit?.commit.author?.date
        ? new Date(latestCommit.commit.author.date)
        : null,
    };

    const repository = await this.prisma.repository.upsert({
      where: { projectId },
      create: payload,
      update: payload,
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        repositoryUrl: remote.html_url,
        defaultBranch: remote.default_branch,
      },
    });

    return repository;
  }

  async sync(projectId: string, userId: string) {
    await this.ensureProjectAccess(projectId, userId);

    const repository = await this.prisma.repository.findUnique({
      where: { projectId },
    });

    if (!repository) {
      throw new NotFoundException('Repository not connected');
    }

    const token = await this.getUserGithubToken(userId);
    const remote = await this.fetchRepository(
      repository.githubOwner,
      repository.repositoryName,
      token,
    );
    const latestCommit = await this.fetchLatestCommit(
      repository.githubOwner,
      repository.repositoryName,
      remote.default_branch,
      token,
    );

    return this.prisma.$transaction(async tx => {
      const updated = await tx.repository.update({
        where: { projectId },
        data: {
          githubRepositoryId: String(remote.id),
          githubOwner: remote.owner.login,
          repositoryName: remote.name,
          cloneUrl: remote.clone_url,
          htmlUrl: remote.html_url,
          defaultBranch: remote.default_branch,
          visibility: remote.private ? Visibility.PRIVATE : Visibility.PUBLIC,
          isConnected: true,
          lastSync: new Date(),
          latestCommitSha: latestCommit?.sha ?? null,
          latestCommitMessage: latestCommit?.commit.message ?? null,
          latestCommitAuthor: latestCommit?.commit.author?.name ?? null,
          latestCommitDate: latestCommit?.commit.author?.date
            ? new Date(latestCommit.commit.author.date)
            : null,
        },
      });

      await tx.project.update({
        where: { id: projectId },
        data: {
          repositoryUrl: remote.html_url,
          defaultBranch: remote.default_branch,
        },
      });

      return updated;
    });
  }

  async disconnect(projectId: string, userId: string) {
    await this.ensureProjectAccess(projectId, userId);

    const repository = await this.prisma.repository.findUnique({
      where: { projectId },
    });

    if (!repository) {
      throw new NotFoundException('Repository not connected');
    }

    await this.prisma.repository.delete({
      where: { projectId },
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        repositoryUrl: null,
      },
    });

    return {
      disconnected: true,
    };
  }
}

function cryptoRandomSecret() {
  return randomBytes(24).toString('hex');
}
