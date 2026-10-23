export interface PayloadItem {
  type: 'registry' | 'service' | 'command';
  path: string;
  property: string;
  value: string | number;
  value_type: 'REG_DWORD' | 'REG_SZ' | 'REG_MULTI_SZ' | 'SERVICE_START' | 'CLI_EXEC';
}

export interface OptimizationModule {
  id: string;
  module_name: string;
  title: string;
  description: string;
  category: 'Kernel & Crash' | 'Thermal & Power' | 'Telemetry & Privacy' | 'Storage & Integrity' | 'Network' | 'Latency & Gaming' | 'USB & Drivers';
  risk_level: 'Seguro (Baixo Risco)' | 'Intermediário' | 'Avançado / Kernel';
  target_windows_versions: string[];
  require_reboot: boolean;
  optimization_payload: PayloadItem[];
  rollback_payload: PayloadItem[];
  executable_script: string;
  rollback_script: string;
  applied?: boolean;
  lastExecutionOutput?: string;
  lastExecutionError?: string;
}

export interface DiagnosticItem {
  id: string;
  title: string;
  suspectCause: string;
  probability: string;
  timeframe: string;
  description: string;
  diagnosticCommand: string;
  emergencyFixCommand: string;
  rollbackCommand: string;
  status: 'idle' | 'testing' | 'executed' | 'error';
  lastOutput?: string;
  lastError?: string;
}

export interface TerminalCommand {
  id: string;
  title: string;
  category: 'Hardware & Térmico' | 'Rede & TCP/IP' | 'Disco & Arquivos' | 'Registro & Tweaks' | 'Processos & Watchdogs' | 'Windows 11 OOBE/Bypass' | 'USB Tethering & Drivers';
  command: string;
  description: string;
  elevation: boolean;
  dangerLevel: 'Baixo' | 'Médio' | 'Alto';
  practicalTip: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'cmd';
  text: string;
  executionTimeMs?: number;
}
