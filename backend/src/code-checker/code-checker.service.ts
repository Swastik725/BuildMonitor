import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

type Severity = 'info' | 'warning' | 'error' | 'critical';

type SnapshotFile = {
  path: string;
  size?: number;
  content?: string;
  sha?: string;
};

type Snapshot = {
  owner: string;
  repo: string;
  defaultBranch: string;
  commitSha: string;
  files: SnapshotFile[];
};

type Finding = {
  id: string;
  severity: Severity;
  title: string;
  details: string;
  evidence: string[];
  suggestedFix?: string;
  autoFixable: boolean;
  files: Array<{ path: string; lines?: number[] }>;
  confidence: number;
  source: 'deterministic' | 'llm';
};

type CheckReport = {
  projectId: string;
  repository: string;
  checkedAt: Date;
  snapshot: {
    commitSha: string;
    fileCount: number;
  };
  findings: Finding[];
};

type HistoryEntry = Pick<CheckReport, 'projectId' | 'repository' | 'checkedAt' | 'findings'> & {
  snapshot: CheckReport['snapshot'];
};

type GitHubRepo = {
  id: number;
  name: string;
  owner: { login: string };
  default_branch: string;
  private: boolean;
};

type GitHubTreeEntry = {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
  sha: string;
};

const MAX_HISTORY = 20;
const SNAPSHOT_FILE_LIMIT = 35;
const SNAPSHOT_BYTE_LIMIT = 120_000;
const historyStore = new Map<string, HistoryEntry[]>();

@Injectable()
export class CodeCheckerService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureAccess(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organization: { members: { some: { userId } } } },
      include: { repository: true },
    });

    if (!project) throw new NotFoundException('Project not found');
    if (!project.repository) throw new BadRequestException('Connect a GitHub repository first');
    return project;
  }

  private githubHeaders() {
    return {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'BuildMonitor',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    };
  }

  private openAiHeaders() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return null;
    }

    return {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  private async fetchRepo(repoOwner: string, repoName: string) {
    const response = await axios.get<GitHubRepo>(
      `https://api.github.com/repos/${repoOwner}/${repoName}`,
      { headers: this.githubHeaders() },
    );
    return response.data;
  }

  private async fetchTree(owner: string, repo: string, branch: string) {
    const branchResponse = await axios.get<{ commit: { sha: string } }>(
      `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`,
      { headers: this.githubHeaders() },
    );
    const sha = branchResponse.data.commit.sha;
    const treeResponse = await axios.get<{ tree: GitHubTreeEntry[] }>(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}`,
      {
        headers: this.githubHeaders(),
        params: { recursive: 1 },
      },
    );

    return { commitSha: sha, tree: treeResponse.data.tree || [] };
  }

  private isRelevantFile(path: string) {
    const normalized = path.toLowerCase();
    return (
      normalized === 'package.json' ||
      normalized === 'pnpm-lock.yaml' ||
      normalized === 'package-lock.json' ||
      normalized === 'yarn.lock' ||
      normalized === 'tsconfig.json' ||
      normalized === 'nest-cli.json' ||
      normalized === 'vercel.json' ||
      normalized.endsWith('.env.example') ||
      normalized.startsWith('.github/workflows/') ||
      normalized.endsWith('.ts') ||
      normalized.endsWith('.js') ||
      normalized.endsWith('.tsx') ||
      normalized.endsWith('.jsx') ||
      normalized.endsWith('.json')
    );
  }

  private selectSnapshotFiles(tree: GitHubTreeEntry[]) {
    const selected = tree
      .filter(entry => entry.type === 'blob' && this.isRelevantFile(entry.path))
      .sort((a, b) => {
        const score = (value: string) => {
          const lower = value.toLowerCase();
          if (lower === 'package.json') return 0;
          if (lower.startsWith('.github/workflows/')) return 1;
          if (lower === 'tsconfig.json' || lower === 'nest-cli.json' || lower === 'vercel.json') return 2;
          if (lower.endsWith('package-lock.json') || lower.endsWith('pnpm-lock.yaml') || lower.endsWith('yarn.lock')) return 3;
          return 4;
        };
        return score(a.path) - score(b.path);
      });

    return selected.slice(0, SNAPSHOT_FILE_LIMIT);
  }

  private async fetchFile(owner: string, repo: string, path: string) {
    const response = await axios.get<{ content: string; encoding: string }>(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
      { headers: this.githubHeaders() },
    );

    if (response.data.encoding !== 'base64') {
      return null;
    }

    return decodeBase64(response.data.content);
  }

  private async buildSnapshot(owner: string, repo: string) {
    const repoInfo = await this.fetchRepo(owner, repo);
    const { commitSha, tree } = await this.fetchTree(owner, repo, repoInfo.default_branch);
    const selected = this.selectSnapshotFiles(tree);

    let usedBytes = 0;
    const files: SnapshotFile[] = [];

    for (const entry of selected) {
      if (usedBytes >= SNAPSHOT_BYTE_LIMIT) {
        break;
      }

      const content = await this.fetchFile(owner, repo, entry.path).catch(() => null);
      if (!content) {
        continue;
      }

      const normalized = content.length > 20_000 ? content.slice(0, 20_000) : content;
      usedBytes += normalized.length;

      files.push({
        path: entry.path,
        size: entry.size,
        sha: entry.sha,
        content: normalized,
      });
    }

    return {
      owner,
      repo,
      defaultBranch: repoInfo.default_branch,
      commitSha,
      files,
    } satisfies Snapshot;
  }

  private analyzeDeterministic(snapshot: Snapshot): Finding[] {
    const findings: Finding[] = [];
    const byPath = new Map(snapshot.files.map(file => [file.path.toLowerCase(), file]));

    const packageJson = byPath.get('package.json');
    if (!packageJson?.content) {
      findings.push(this.finding('Missing package.json', 'error', 'The repository snapshot did not include a root package.json.', ['package.json is missing from the snapshot.'], 'Add a root package.json with scripts for build and start.', false, [], 0.98));
    } else {
      try {
        const parsed = JSON.parse(packageJson.content);
        if (!parsed.scripts?.build) {
          findings.push(this.finding('Missing build script', 'warning', 'package.json does not define scripts.build.', ['package.json -> scripts'], 'Add a build script that compiles the app before deployment.', true, [{ path: 'package.json', lines: [1] }], 0.9));
        }
        if (!parsed.scripts?.start) {
          findings.push(this.finding('Missing start script', 'warning', 'package.json does not define scripts.start.', ['package.json -> scripts'], 'Add a start script so the runtime entrypoint is explicit.', true, [{ path: 'package.json', lines: [1] }], 0.9));
        }
        if (!parsed.scripts?.lint) {
          findings.push(this.finding('Missing lint script', 'info', 'A lint script is absent, so automated code quality checks are limited.', ['package.json -> scripts'], 'Add a lint script if you want the checker to validate style and obvious issues faster.', true, [{ path: 'package.json', lines: [1] }], 0.72));
        }
      } catch {
        findings.push(this.finding('Invalid package.json', 'error', 'package.json could not be parsed as JSON.', ['JSON parse failed'], 'Fix the JSON syntax in package.json.', false, [{ path: 'package.json', lines: [1] }], 0.99));
      }
    }

    const workflow = snapshot.files.find(file => file.path.toLowerCase().startsWith('.github/workflows/'));
    if (!workflow) {
      findings.push(this.finding('Missing deployment workflow', 'warning', 'No GitHub Actions workflow file was found in .github/workflows.', ['.github/workflows/* is missing'], 'Add or reconnect the workflow file used for deployment.', true, [], 0.86));
    }

    const hasNext = snapshot.files.some(file => file.path.toLowerCase().includes('next.config.'));
    const hasNest = snapshot.files.some(file => file.path.toLowerCase() === 'nest-cli.json' || file.path.toLowerCase().includes('app.module.ts'));
    if (!hasNext && !hasNest) {
      findings.push(this.finding('Unknown stack shape', 'info', 'The snapshot does not clearly match a known Next.js or NestJS layout.', ['Entry files were not obvious'], 'Include entrypoints so the code checker can make stronger framework-specific recommendations.', false, [], 0.58));
    }

    const envExample = snapshot.files.find(file => file.path.toLowerCase().endsWith('.env.example'));
    if (!envExample) {
      findings.push(this.finding('Missing env example', 'info', 'No .env.example file was found in the snapshot.', ['.env.example missing'], 'Add a .env.example file to document required runtime variables.', true, [], 0.8));
    }

    return findings;
  }

  private finding(
    title: string,
    severity: Severity,
    details: string,
    evidence: string[],
    suggestedFix: string | undefined,
    autoFixable: boolean,
    files: Array<{ path: string; lines?: number[] }>,
    confidence: number,
    source: 'deterministic' | 'llm' = 'deterministic',
  ): Finding {
    return {
      id: `${source}-${severity}-${slugify(title)}-${Math.random().toString(36).slice(2, 8)}`,
      severity,
      title,
      details,
      evidence,
      suggestedFix,
      autoFixable,
      files,
      confidence,
      source,
    };
  }

  private async synthesizeWithLlm(snapshot: Snapshot, deterministicFindings: Finding[]) {
    const headers = this.openAiHeaders();
    if (!headers || deterministicFindings.length === 0) {
      return [];
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
    const input = {
      repository: `${snapshot.owner}/${snapshot.repo}`,
      commitSha: snapshot.commitSha,
      deterministicFindings,
      files: snapshot.files.map(file => ({
        path: file.path,
        content: file.content,
      })),
    };

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a senior code reviewer. Produce precise, non-hallucinated findings based only on the provided repository snapshot and deterministic findings. Return JSON with a "findings" array. Each finding must have title, severity, details, evidence, suggestedFix, autoFixable, files, and confidence.',
          },
          {
            role: 'user',
            content: JSON.stringify(input),
          },
        ],
      },
      { headers },
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      return [];
    }

    try {
      const parsed = JSON.parse(content);
      const findings = Array.isArray(parsed.findings) ? parsed.findings : [];
      return findings
        .filter(Boolean)
        .map((finding: any) =>
          this.finding(
            String(finding.title || 'Unnamed issue'),
            normalizeSeverity(finding.severity),
            String(finding.details || ''),
            Array.isArray(finding.evidence) ? finding.evidence.map(String) : [],
            finding.suggestedFix ? String(finding.suggestedFix) : undefined,
            Boolean(finding.autoFixable),
            Array.isArray(finding.files)
              ? finding.files.map((file: any) => ({
                  path: String(file.path || ''),
                  lines: Array.isArray(file.lines) ? file.lines.map((line: any) => Number(line)).filter(Number.isFinite) : undefined,
                }))
              : [],
            typeof finding.confidence === 'number' ? finding.confidence : 0.7,
            'llm',
          ),
        );
    } catch {
      return [];
    }
  }

  async check(projectId: string, userId: string) {
    const project = await this.ensureAccess(projectId, userId);
    const repo = project.repository!;
    const snapshot = await this.buildSnapshot(repo.githubOwner, repo.repositoryName);
    const deterministicFindings = this.analyzeDeterministic(snapshot);
    const llmFindings = await this.synthesizeWithLlm(snapshot, deterministicFindings);

    const findings = this.rankFindings([
      ...deterministicFindings,
      ...llmFindings,
    ]);

    const report: CheckReport = {
      projectId,
      repository: `${repo.githubOwner}/${repo.repositoryName}`,
      checkedAt: new Date(),
      snapshot: {
        commitSha: snapshot.commitSha,
        fileCount: snapshot.files.length,
      },
      findings,
    };

    const history = historyStore.get(projectId) || [];
    history.unshift(report);
    historyStore.set(projectId, history.slice(0, MAX_HISTORY));

    return report;
  }

  async history(projectId: string, userId: string) {
    await this.ensureAccess(projectId, userId);
    return historyStore.get(projectId) || [];
  }

  private rankFindings(findings: Finding[]) {
    return [...new Map(findings.map(item => [item.title + item.details, item])).values()].sort((a, b) => {
      const severityWeight: Record<Severity, number> = {
        critical: 0,
        error: 1,
        warning: 2,
        info: 3,
      };
      return severityWeight[a.severity] - severityWeight[b.severity] || b.confidence - a.confidence;
    });
  }
}

function decodeBase64(content: string) {
  return Buffer.from(content.replace(/\n/g, ''), 'base64').toString('utf8');
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function normalizeSeverity(value: unknown): Severity {
  if (value === 'critical' || value === 'error' || value === 'warning' || value === 'info') {
    return value;
  }
  return 'info';
}
