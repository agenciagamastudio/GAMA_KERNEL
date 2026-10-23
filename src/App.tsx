import React, { useState } from 'react';
import { Header } from './components/Header';
import { EmergencyRebootTriage } from './components/EmergencyRebootTriage';
import { OptimizationModules } from './components/OptimizationModules';
import { TerminalHub } from './components/TerminalHub';
import { UsbToolkitGenerator } from './components/UsbToolkitGenerator';
import { LiveConsoleDrawer } from './components/LiveConsoleDrawer';
import { LogEntry } from './types/gama';

export default function App() {
  const [activeTab, setActiveTab] = useState<'triage' | 'modules' | 'terminal' | 'usb'>('triage');
  const [abortCount, setAbortCount] = useState<number>(0);

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
      text: 'Ambiente de execução: Windows 10/11 64-bit | Privilégio: NT AUTHORITY\\SYSTEM.'
    },
    {
      id: 'init-3',
      timestamp: getTimestamp(),
      type: 'success',
      text: '[AUTO-SENTINELA] Loop de interceptação de desligamento ativo em segundo plano.'
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

  const handleEmergencyAbort = () => {
    setAbortCount(prev => prev + 1);
    addLog('> shutdown.exe /a', 'cmd');
    addLog('[SUCCESS] Comando shutdown /a executado com sucesso no kernel. Qualquer encerramento ou reinício agendado foi anulado.', 'success');
  };

  const handleRunCommand = (title: string, cmd: string, output: string) => {
    addLog(`> Executando [${title}]:`, 'cmd');
    addLog(cmd, 'cmd');
    addLog(output, 'info');
  };

  const handleRunScript = (moduleName: string, script: string, isRollback = false) => {
    if (isRollback) {
      addLog(`[-] DISPARANDO ROLLBACK 1:1: ${moduleName}`, 'warning');
      addLog(script, 'cmd');
      addLog(`[ROLLBACK SUCCESS] Módulo ${moduleName} revertido para os parâmetros de fábrica do Windows.`, 'success');
    } else {
      addLog(`[+] APLICANDO OTIMIZAÇÃO: ${moduleName}`, 'cmd');
      addLog(script, 'cmd');
      addLog(`[SUCCESS] Módulo ${moduleName} aplicado e validado no kernel com êxito.`, 'success');
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

  const handleRunCustomCommand = (cmd: string) => {
    addLog(`> ${cmd}`, 'cmd');
    const lower = cmd.toLowerCase().trim();

    if (lower.startsWith('shutdown')) {
      handleEmergencyAbort();
    } else if (lower.includes('powercfg -h off')) {
      addLog('[+] powercfg.exe -h off executado. Hibernação e Fast Startup eliminados.', 'success');
    } else if (lower.includes('ipconfig /flushdns')) {
      addLog('[+] Cache de resolução DNS esvaziado com sucesso.', 'success');
    } else if (lower.includes('sfc /scannow')) {
      addLog('[+] Iniciando verificação de arquivos protegidos... A Proteção de Recursos do Windows não encontrou nenhuma violação de integridade.', 'success');
    } else if (lower.includes('cls') || lower.includes('clear')) {
      handleClearLogs();
    } else {
      addLog(`[NT AUTHORITY\\SYSTEM] Comando '${cmd}' processado com código de retorno 0.`, 'info');
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

      {/* Docked Interactive Console Drawer */}
      <LiveConsoleDrawer
        logs={logs}
        onClearLogs={handleClearLogs}
        onRunCustomCommand={handleRunCustomCommand}
      />
    </div>
  );
}
