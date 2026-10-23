export interface CommandResponse {
  stdout: string;
  stderr: string;
  exitCode: number;
  platform: string;
  isWindows: boolean;
  isAdmin: boolean;
  executionTimeMs: number;
}

export interface SystemStatus {
  platform: string;
  hostname: string;
  uptime: number;
  cpus: number;
  cpuModel: string;
  totalMemoryGB: string;
  freeMemoryGB: string;
  usedMemoryPercent: number;
  isWindows: boolean;
  isAdmin: boolean;
  activeInterfaces: string[];
}

export async function executeKernelApi(
  command: string,
  shell: 'powershell' | 'cmd' = 'powershell'
): Promise<CommandResponse> {
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
}

export async function abortShutdownApi(): Promise<{ success: boolean; message: string; details?: CommandResponse }> {
  const res = await fetch('/api/abort-shutdown', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }

  return await res.json();
}

export async function applyTetheringMitigationApi(): Promise<{ success: boolean; message: string; details?: CommandResponse }> {
  const res = await fetch('/api/tethering-mitigation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }

  return await res.json();
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
