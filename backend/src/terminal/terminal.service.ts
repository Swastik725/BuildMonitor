import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTerminalSessionDto } from './dto/create-terminal-session.dto';
import { Observable } from 'rxjs';

type SessionState = {
  id: string;
  projectId: string;
  userId: string;
  cwd: string;
  shell: string;
  createdAt: Date;
  closedAt?: Date;
  history: Array<{ command: string; stdout: string; stderr: string; exitCode: number | null; startedAt: Date; finishedAt: Date }>;
};

const sessions = new Map<string, SessionState>();

@Injectable()
export class TerminalService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureProjectAccess(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        organization: { members: { some: { userId } } },
      },
      select: { id: true, slug: true, organization: { select: { slug: true } } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  private getWorkspaceRoot() {
    return path.resolve(process.env.PROJECT_WORKSPACE_ROOT || process.cwd());
  }

  private resolveWorkspacePath(project: { slug: string; organization: { slug: string } }) {
    return path.resolve(this.getWorkspaceRoot(), project.organization.slug, project.slug);
  }

  private ensureWithinWorkspace(resolvedPath: string) {
    const root = this.getWorkspaceRoot() + path.sep;
    const normalized = path.resolve(resolvedPath) + path.sep;
    if (!normalized.startsWith(root)) {
      throw new BadRequestException('Path escapes the workspace root');
    }
  }

  private resolveShell(shell?: string) {
    if (process.platform === 'win32') {
      return shell && shell.toLowerCase() === 'powershell' ? 'powershell.exe' : 'cmd.exe';
    }
    return shell && shell.trim() ? shell : '/bin/bash';
  }

  private sessionToResponse(session: SessionState) {
    return {
      id: session.id,
      projectId: session.projectId,
      cwd: session.cwd,
      shell: session.shell,
      createdAt: session.createdAt,
      closedAt: session.closedAt ?? null,
      history: session.history,
    };
  }

  async createSession(projectId: string, userId: string, dto: CreateTerminalSessionDto) {
    const project = await this.ensureProjectAccess(projectId, userId);
    const cwd = this.resolveWorkspacePath(project);
    this.ensureWithinWorkspace(cwd);
    const id = cryptoRandomId();
    const session: SessionState = {
      id,
      projectId,
      userId,
      cwd,
      shell: this.resolveShell(dto.shell),
      createdAt: new Date(),
      history: [],
    };
    sessions.set(id, session);
    return this.sessionToResponse(session);
  }

  async listSessions(projectId: string, userId: string) {
    await this.ensureProjectAccess(projectId, userId);
    return [...sessions.values()]
      .filter(session => session.projectId === projectId && session.userId === userId)
      .map(session => this.sessionToResponse(session));
  }

  async getSession(projectId: string, sessionId: string, userId: string) {
    await this.ensureProjectAccess(projectId, userId);
    const session = sessions.get(sessionId);
    if (!session || session.projectId !== projectId || session.userId !== userId) {
      throw new NotFoundException('Terminal session not found');
    }
    return session;
  }

  async runCommand(projectId: string, sessionId: string, userId: string, command: string) {
    const session = await this.getSession(projectId, sessionId, userId);
    if (!command?.trim()) {
      throw new BadRequestException('Command is required');
    }
    if (session.closedAt) {
      throw new BadRequestException('Session is closed');
    }

    const execution = await this.execute(session, command);

    const finishedAt = new Date();
    session.history.push({ command, stdout: execution.stdout, stderr: execution.stderr, exitCode: execution.exitCode, startedAt: execution.startedAt, finishedAt });
    return { ...execution, finishedAt };
  }

  streamCommand(projectId: string, sessionId: string, userId: string, command: string) {
    return new Observable<MessageEvent>(subscriber => {
      void this.getSession(projectId, sessionId, userId)
        .then(session => {
          if (!command?.trim()) {
            throw new BadRequestException('Command is required');
          }
          if (session.closedAt) {
            throw new BadRequestException('Session is closed');
          }

          const normalized = command.trim();
          const startedAt = new Date();
          const emit = (event: string, data: unknown) => subscriber.next({ type: event, data } as MessageEvent);

          emit('start', { command: normalized, cwd: session.cwd, startedAt });

          const finish = (payload: { stdout: string; stderr: string; exitCode: number | null }) => {
            const finishedAt = new Date();
            session.history.push({ command: normalized, stdout: payload.stdout, stderr: payload.stderr, exitCode: payload.exitCode, startedAt, finishedAt });
            emit('complete', { ...payload, startedAt, finishedAt });
            subscriber.complete();
          };

          if (normalized === 'pwd') {
            finish({ stdout: `${session.cwd}${os.EOL}`, stderr: '', exitCode: 0 });
            return;
          }

          if (normalized === 'exit') {
            session.closedAt = new Date();
            finish({ stdout: '', stderr: '', exitCode: 0 });
            return;
          }

          if (normalized.startsWith('cd ')) {
            const target = normalized.slice(3).trim();
            const nextDir = path.resolve(session.cwd, target || '.');
            this.ensureWithinWorkspace(nextDir);
            if (!fs.existsSync(nextDir) || !fs.statSync(nextDir).isDirectory()) {
              throw new BadRequestException('Target directory does not exist');
            }
            session.cwd = nextDir;
            emit('output', { stream: 'stdout', chunk: '', line: `changed directory to ${nextDir}` });
            finish({ stdout: '', stderr: '', exitCode: 0 });
            return;
          }

          const child = spawn(session.shell, process.platform === 'win32' ? ['/c', normalized] : ['-lc', normalized], {
            cwd: session.cwd,
            env: {
              ...process.env,
              TERM: process.env.TERM || 'xterm-256color',
            },
            shell: false,
          });

          let stdout = '';
          let stderr = '';
          const timeout = setTimeout(() => {
            child.kill('SIGKILL');
            emit('error', { message: 'Command timed out after 60 seconds' });
          }, 60000);

          child.stdout.on('data', chunk => {
            const text = chunk.toString();
            stdout += text;
            for (const line of text.split(/\r?\n/).filter(Boolean)) {
              emit('output', { stream: 'stdout', chunk: line + os.EOL, line });
            }
          });

          child.stderr.on('data', chunk => {
            const text = chunk.toString();
            stderr += text;
            for (const line of text.split(/\r?\n/).filter(Boolean)) {
              emit('output', { stream: 'stderr', chunk: line + os.EOL, line });
            }
          });

          child.on('error', err => {
            clearTimeout(timeout);
            emit('error', { message: err.message });
            subscriber.error(err);
          });

          child.on('close', exitCode => {
            clearTimeout(timeout);
            finish({ stdout, stderr, exitCode });
          });
        })
        .catch(err => subscriber.error(err));

      return () => {
        subscriber.complete();
      };
    });
  }

  async closeSession(projectId: string, sessionId: string, userId: string) {
    const session = await this.getSession(projectId, sessionId, userId);
    session.closedAt = new Date();
    return this.sessionToResponse(session);
  }

  async destroySession(projectId: string, sessionId: string, userId: string) {
    const session = await this.getSession(projectId, sessionId, userId);
    sessions.delete(session.id);
    return { deleted: true };
  }

  private async execute(session: SessionState, command: string) {
    const startedAt = new Date();
    const normalized = command.trim();

    if (normalized === 'pwd') {
      return {
        stdout: session.cwd + os.EOL,
        stderr: '',
        exitCode: 0,
        startedAt,
      };
    }

    if (normalized === 'exit') {
      session.closedAt = new Date();
      return {
        stdout: '',
        stderr: '',
        exitCode: 0,
        startedAt,
      };
    }

    if (normalized.startsWith('cd ')) {
      const target = normalized.slice(3).trim();
      const nextDir = path.resolve(session.cwd, target || '~');
      this.ensureWithinWorkspace(nextDir);
      if (!fs.existsSync(nextDir) || !fs.statSync(nextDir).isDirectory()) {
        throw new BadRequestException('Target directory does not exist');
      }
      session.cwd = nextDir;
      return {
        stdout: '',
        stderr: '',
        exitCode: 0,
        startedAt,
      };
    }

    return await new Promise<{ stdout: string; stderr: string; exitCode: number | null; startedAt: Date }>((resolve, reject) => {
      const child = spawn(session.shell, process.platform === 'win32' ? ['/c', normalized] : ['-lc', normalized], {
        cwd: session.cwd,
        env: {
          ...process.env,
          TERM: process.env.TERM || 'xterm-256color',
        },
        shell: false,
      });

      let stdout = '';
      let stderr = '';
      const timeout = setTimeout(() => child.kill('SIGKILL'), 60000);

      child.stdout.on('data', chunk => {
        stdout += chunk.toString();
      });
      child.stderr.on('data', chunk => {
        stderr += chunk.toString();
      });
      child.on('error', err => {
        clearTimeout(timeout);
        reject(err);
      });
      child.on('close', exitCode => {
        clearTimeout(timeout);
        resolve({ stdout, stderr, exitCode, startedAt });
      });
    });
  }
}

function cryptoRandomId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
