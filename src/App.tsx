import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EmergencyRebootTriage } from './components/EmergencyRebootTriage';
import { OptimizationModules } from './components/OptimizationModules';
import { TerminalHub } from './components/TerminalHub';
import { UsbToolkitGenerator } from './components/UsbToolkitGenerator';
import { LiveConsoleDrawer } from './components/LiveConsoleDrawer';
import { LogEntry } from './types/gama';
import { executeKernelApi, abortShutdownApi, getSystemStatusApi, SystemStatus } from './services/api';

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
      text: 'Camada de backend Express + child_process ativa em http://localhost:3000/api.'
    },
    {
      id: 'init-3',
      timestamp: getTimestamp(),
      type: 'success',
      text: '[AUTO-SENTINELA] Interceptador de desligamento em background pronto para execução real.'
    }
  ]);

  const addLog = (text: string, type: 'info' | 'success' | 'warning' | 'error' | 'cmd' = 'info') => {
    setLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: getTimestamp(),
        type,
        text
      }
    ]);
  };

  // Check backend status on mount
  useEffect(() => {
    getSystemStatusApi().then(status => {
      if (status) {
        setSystemStatus(status);
        addLog(
          `[BACKEND CONECTADO] Host: ${status.hostname} | Núcleos CPU: ${status.cpus} | Memória: ${status.freeMemoryGB}GB livre / ${status.totalMemoryGB}GB | OS: ${status.platform} (${status.isWindows ? 'Windows Nativo - Execução Real' : 'Ambiente de Simulação Dev'})`,
          'info'
        );
      }
    });
  }, []);

  const handleEmergencyAbort = async () => {
    setAbortCount(prev => prev + 1);
    addLog('> shutdown.exe /a (Enviando ao backend child_process...)', 'cmd');
    
    try {
      const res = await abortShutdownApi();
      if (res.details?.stdout) {
        addLog(res.details.stdout, 'success');
      } else {
        addLog(`[SUCCESS] ${res.message || 'shutdown /a executado com sucesso no kernel.'}`, 'success');
      }
    } catch (err: any) {
      addLog(`[FAIL] ${err?.message}`, 'error');
    }
  };

  const handleRunCommand = async (title: string, cmd: string, defaultOutput?: string) => {
    addLog(`> Executando [${title}]:`, 'cmd');
    addLog(cmd, 'cmd');
    
    try {
      const res = await executeKernelApi(cmd);
      if (res.stdout) {
        addLog(res.stdout, 'success');
      } else if (defaultOutput) {
        addLog(defaultOutput, 'info');
      }
      if (res.stderr) {
        addLog(`[STDERR] ${res.stderr}`, 'warning');
      }
    } catch (err: any) {
      addLog(`[ERRO NA EXECUÇÃO] ${err.message}`, 'error');
    }
  };

  const handleRunScript = async (moduleName: string, script: string, isRollback = false) => {
    if (isRollback) {
      addLog(`[-] DISPARANDO ROLLBACK 1:1: ${moduleName}`, 'warning');
      addLog(script, 'cmd');
    } else {
      addLog(`[+] APLICANDO OTIMIZAÇÃO KERNEL: ${moduleName}`, 'cmd');
      addLog(script, 'cmd');
    }

    try {
      const res = await executeKernelApi(script, 'powershell');
      if (res.stdout) {
        addLog(res.stdout, 'success');
      }
      if (res.stderr) {
        addLog(`[STDERR] ${res.stderr}`, 'warning');
      }
      addLog(
        isRollback
          ? `[ROLLBACK CONCLUÍDO] Parâmetros de fábrica restaurados para ${moduleName}.`
          : `[SUCESSO] Módulo ${moduleName} executado e gravado no kernel.`,
        'success'
      );
    } catch (err: any) {
      addLog(`[ERRO NO MÓDULO] ${err.message}`, 'error');
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
        addLog(res.stdout, 'info');
      }
      if (res.stderr) {
        addLog(res.stderr, 'error');
      }
      if (!res.stdout && !res.stderr) {
        addLog(`[OK] Comando executado com código de retorno 0.`, 'success');
      }
    } catch (err: any) {
      addLog(`[ERRO DE EXECUÇÃO] ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col pb-36 selection:bg-[#88CE11] selection:text-[#161616]">
      {/* Top Header with navigation and quick abort */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onEmergencyAbort={handleEmergencyAbort}
        abortCount={abortCount}
        isWindowsNative={systemStatus?.isWindows}
      />

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

      {/* Docked Interactive Console Drawer with real stdout/stderr */}
      <LiveConsoleDrawer
        logs={logs}
        onClearLogs={handleClearLogs}
        onRunCustomCommand={handleRunCustomCommand}
      />
    </div>
  );
}
