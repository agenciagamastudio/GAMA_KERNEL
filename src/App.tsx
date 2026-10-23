import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EmergencyRebootTriage } from './components/EmergencyRebootTriage';
import { OptimizationModules } from './components/OptimizationModules';
import { TerminalHub } from './components/TerminalHub';
import { UsbToolkitGenerator } from './components/UsbToolkitGenerator';
import { LiveConsoleDrawer } from './components/LiveConsoleDrawer';
import { LogEntry } from './types/gama';
import { 
  executeKernelApi, 
  abortShutdownApi, 
  applyTetheringMitigationApi,
  getSystemStatusApi, 
  SystemStatus,
  CommandResponse
} from './services/api';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'triage' | 'modules' | 'terminal' | 'usb'>('triage');
  const [abortCount, setAbortCount] = useState<number>(0);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  const getTimestamp = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  };

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      timestamp: getTimestamp(),
      type: 'info',
      text: 'GAMA KERNEL-LEVEL AUTOMATION ENGINE v2.0.0 INICIALIZADO.'
    },
    {
      id: 'init-2',
      timestamp: getTimestamp(),
      type: 'info',
      text: 'Ponte de execução em tempo real child_process ativa em /api/execute.'
    },
    {
      id: 'init-3',
      timestamp: getTimestamp(),
      type: 'success',
      text: '[MODO REAL OPERACIONAL] Scripts despachados diretamente para o PowerShell do host.'
    }
  ]);

  const addLog = (text: string, type: 'info' | 'success' | 'warning' | 'error' | 'cmd' = 'info', executionTimeMs?: number) => {
    setLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: getTimestamp(),
        type,
        text,
        executionTimeMs
      }
    ]);
  };

  // Check backend status on mount
  useEffect(() => {
    getSystemStatusApi().then(status => {
      if (status) {
        setSystemStatus(status);
        const adminText = status.isAdmin
          ? 'NT AUTHORITY\\SYSTEM (ELEVADO - ACESSO TOTAL)'
          : 'USUÁRIO PADRÃO (AVISO: Execute como Administrador para privilégio em HKLM e sc.exe)';

        addLog(
          `[HOST CONECTADO] ${status.hostname} | CPU: ${status.cpuModel} (${status.cpus} núcleos) | RAM: ${status.freeMemoryGB}GB livre / ${status.totalMemoryGB}GB | Privilégio: ${adminText}`,
          status.isAdmin ? 'success' : 'warning'
        );
      }
    });
  }, []);

  const handleEmergencyAbort = async () => {
    setAbortCount(prev => prev + 1);
    addLog('> shutdown.exe /a (Despachando ao kernel do host...)', 'cmd');
    
    try {
      const res = await abortShutdownApi();
      if (res.details?.stdout) {
        addLog(res.details.stdout, 'success', res.details.executionTimeMs);
      } else {
        addLog(`[OK] ${res.message || 'shutdown /a executado com sucesso no kernel.'}`, 'success');
      }
    } catch (err: any) {
      addLog(`[FALHA] ${err?.message}`, 'error');
    }
  };

  const handleTetheringMitigate = async () => {
    addLog('> [ANTI-BSOD TETHERING] Exterminando serviços do CPU-Z e resetando pilha RNDIS...', 'cmd');
    try {
      const res = await applyTetheringMitigationApi();
      if (res.details?.stdout) {
        addLog(res.details.stdout, 'success', res.details.executionTimeMs);
      }
      if (res.details?.stderr) {
        addLog(`[STDERR] ${res.details.stderr}`, 'warning');
      }
      addLog('[SUCCESS] Mitigação de USB Tethering concluída. O celular Android pode ser conectado.', 'success');
    } catch (err: any) {
      addLog(`[ERRO NA MITIGAÇÃO] ${err.message}`, 'error');
    }
  };

  const handleRunCommand = async (title: string, cmd: string): Promise<CommandResponse | null> => {
    addLog(`> Invocando [${title}]:`, 'cmd');
    addLog(cmd, 'cmd');
    
    try {
      const res = await executeKernelApi(cmd);
      if (res.stdout) {
        addLog(res.stdout, 'success', res.executionTimeMs);
      }
      if (res.stderr) {
        addLog(`[STDERR] ${res.stderr}`, res.exitCode === 0 ? 'warning' : 'error', res.executionTimeMs);
      }
      if (!res.stdout && !res.stderr) {
        addLog('[OK] Comando concluído no host com código de retorno 0.', 'success', res.executionTimeMs);
      }
      return res;
    } catch (err: any) {
      addLog(`[ERRO DE EXECUÇÃO] ${err.message}`, 'error');
      return null;
    }
  };

  const handleRunScript = async (moduleName: string, script: string, isRollback = false): Promise<CommandResponse | null> => {
    if (isRollback) {
      addLog(`[-] DISPARANDO ROLLBACK 1:1: ${moduleName}`, 'warning');
      addLog(script, 'cmd');
    } else {
      addLog(`[+] APLICANDO OTIMIZAÇÃO NO KERNEL: ${moduleName}`, 'cmd');
      addLog(script, 'cmd');
    }

    try {
      const res = await executeKernelApi(script, 'powershell');
      if (res.stdout) {
        addLog(res.stdout, 'success', res.executionTimeMs);
      }
      if (res.stderr) {
        addLog(`[STDERR] ${res.stderr}`, 'warning', res.executionTimeMs);
      }
      addLog(
        isRollback
          ? `[ROLLBACK CONCLUÍDO] Parâmetros de fábrica restaurados para ${moduleName}.`
          : `[SUCESSO] Módulo ${moduleName} executado e gravado no kernel com êxito.`,
        'success',
        res.executionTimeMs
      );
      return res;
    } catch (err: any) {
      addLog(`[ERRO NO MÓDULO] ${err.message}`, 'error');
      return null;
    }
  };

  const handleClearLogs = () => {
    setLogs([
      {
        id: `clear-${Date.now()}`,
        timestamp: getTimestamp(),
        type: 'info',
        text: 'Histórico de console limpo pelo operador.'
      }
    ]);
  };

  const handleRunCustomCommand = async (cmd: string) => {
    addLog(`> ${cmd}`, 'cmd');
    const lower = cmd.toLowerCase().trim();

    if (lower === 'cls' || lower === 'clear') {
      handleClearLogs();
      return;
    }

    try {
      const res = await executeKernelApi(cmd, lower.includes('reg ') || lower.includes('netsh ') ? 'cmd' : 'powershell');
      if (res.stdout) {
        addLog(res.stdout, 'info', res.executionTimeMs);
      }
      if (res.stderr) {
        addLog(res.stderr, res.exitCode === 0 ? 'warning' : 'error', res.executionTimeMs);
      }
      if (!res.stdout && !res.stderr) {
        addLog(`[OK] Processo finalizado com código de saída 0.`, 'success', res.executionTimeMs);
      }
    } catch (err: any) {
      addLog(`[ERRO] ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col pb-36 selection:bg-[#88CE11] selection:text-[#161616]">
      {/* Top Header with navigation, privilege status, quick abort and tethering mitigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onEmergencyAbort={handleEmergencyAbort}
        onTetheringMitigate={handleTetheringMitigate}
        abortCount={abortCount}
        isWindowsNative={systemStatus?.isWindows}
        isAdmin={systemStatus?.isAdmin}
      />

      {/* Non-Admin Privilege Warning Banner if running on Windows without elevation */}
      {systemStatus?.isWindows && !systemStatus?.isAdmin && (
        <div className="bg-amber-500/20 border-b border-amber-500/50 px-4 py-2.5 text-xs text-amber-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Atenção Técnica:</strong> O servidor Node.js está rodando sem privilégios de Administrador. Comandos que modificam <code>HKLM</code> ou controlam serviços (<code>sc.exe</code>) podem retornar &quot;Acesso Negado&quot;. Feche e execute o script <code>GAMA_EMERGENCY_PORTABLE.bat</code> como Administrador.
              </span>
            </div>
            <button
              onClick={() => handleRunCustomCommand('Start-Process powershell -Verb RunAs')}
              className="px-2.5 py-1 bg-amber-400 text-[#161616] font-bold rounded text-[11px] whitespace-nowrap hover:bg-amber-300 transition-colors"
            >
              Elevar PowerShell (RunAs)
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'triage' && (
          <EmergencyRebootTriage onRunCommand={handleRunCommand} />
        )}

        {activeTab === 'modules' && (
          <OptimizationModules onRunScript={handleRunScript} />
        )}

        {activeTab === 'terminal' && (
          <TerminalHub onRunInConsole={handleRunCommand} />
        )}

        {activeTab === 'usb' && (
          <UsbToolkitGenerator />
        )}
      </main>

      {/* Docked Interactive Console Drawer with real stdout/stderr streams */}
      <LiveConsoleDrawer
        logs={logs}
        onClearLogs={handleClearLogs}
        onRunCustomCommand={handleRunCustomCommand}
      />
    </div>
  );
}
