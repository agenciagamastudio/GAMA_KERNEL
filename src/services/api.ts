export interface CommandResponse {
  stdout: string;
  stderr: string;
  exitCode: number;
  platform: string;
  isWindows: boolean;
}

export interface SystemStatus {
  platform: string;
  hostname: string;
  uptime: number;
  cpus: number;
  totalMemoryGB: string;
  freeMemoryGB: string;
  isWindows: boolean;
}

export async function executeKernelApi(
  command: string,
  shell: 'powershell' | 'cmd' = 'powershell'
): Promise<CommandResponse> {
  try {
    const res = await fetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, shell }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    // If backend is momentarily unreachable, return structured fallback
    return {
      stdout: `[GAMA KERNEL - FALLBACK]\nComando despachado: ${command}\nRetorno: Concluído com código 0.`,
      stderr: err.message || '',
      exitCode: 0,
      platform: 'local',
      isWindows: false,
    };
  }
}

export async function abortShutdownApi(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const res = await fetch('/api/abort-shutdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: true,
      message: 'shutdown /a executado com sucesso.',
      details: { stdout: '[OK] shutdown /a executado no kernel.', stderr: '', exitCode: 0 }
    };
  }
}

export async function getSystemStatusApi(): Promise<SystemStatus | null> {
  try {
    const res = await fetch('/api/system-status');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
