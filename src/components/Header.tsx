import React, { useState } from 'react';
import { ShieldAlert, Terminal, Cpu, Usb, Sliders, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'triage' | 'modules' | 'terminal' | 'usb';
  setActiveTab: (tab: 'triage' | 'modules' | 'terminal' | 'usb') => void;
  onEmergencyAbort: () => void;
  abortCount: number;
  isWindowsNative?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onEmergencyAbort,
  abortCount,
  isWindowsNative
}) => {
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleQuickAbort = () => {
    onEmergencyAbort();
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#161616]/95 backdrop-blur-md border-b border-[#52525B] px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark with GAMA neon accent */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#272727] border border-[#52525B] flex items-center justify-center text-[#88CE11] font-mono font-bold text-lg shadow-sm">
            Γ
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                GAMA KERNEL ENGINE
              </span>
              <span className="text-[10px] font-mono uppercase bg-[#272727] text-[#88CE11] px-1.5 py-0.5 rounded border border-[#52525B]/60">
                v2.0.0
              </span>
            </div>
            <span className="text-xs text-[#A1A1AA] hidden sm:inline">
              Automação de Baixo Nível &amp; Diagnóstico de Campo
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links / Segmented Tabs */}
        <nav className="flex items-center gap-1.5 p-1 bg-[#272727] rounded-lg border border-[#52525B]/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('triage')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'triage'
                ? 'bg-[#161616] text-[#88CE11] shadow-sm border border-[#88CE11]/30 font-semibold'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#88CE11]" />
            <span>Triagem 5-Minutos</span>
          </button>

          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'modules'
                ? 'bg-[#161616] text-[#88CE11] shadow-sm border border-[#88CE11]/30 font-semibold'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#88CE11]" />
            <span>Módulos de Otimização</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'terminal'
                ? 'bg-[#161616] text-[#88CE11] shadow-sm border border-[#88CE11]/30 font-semibold'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-[#88CE11]" />
            <span>Macetes de Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('usb')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'usb'
                ? 'bg-[#161616] text-[#88CE11] shadow-sm border border-[#88CE11]/30 font-semibold'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Usb className="w-3.5 h-3.5 text-[#88CE11]" />
            <span>Kit Pendrive Portátil</span>
          </button>
        </nav>

        {/* Zone 3: Emergency Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-[#A1A1AA] bg-[#272727] px-2.5 py-1 rounded border border-[#52525B]/40">
            <span className="w-2 h-2 rounded-full bg-[#88CE11]" />
            <span>EXEC: {isWindowsNative ? 'WINDOWS NATIVO' : 'CONTAINER DEV'}</span>
          </div>

          <button
            onClick={handleQuickAbort}
            title="Executa 'shutdown.exe /a' instantaneamente para cancelar desligamento programado"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-[#88CE11] text-[#161616] hover:bg-[#9deb17] active:scale-95 transition-all shadow-md whitespace-nowrap cursor-pointer"
          >
            <Cpu className="w-4 h-4 text-[#161616]" />
            <span>ABORTAR SHUTDOWN (shutdown /a)</span>
            {abortCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-[#161616] text-[#88CE11] text-[10px] rounded-full font-mono">
                {abortCount}x
              </span>
            )}
          </button>
        </div>
      </div>

      {copiedNotification && (
        <div className="max-w-7xl mx-auto mt-2">
          <div className="bg-[#272727] border border-[#88CE11]/50 text-white text-xs px-3 py-1.5 rounded flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-[#88CE11]" />
            <span>Comando <strong className="font-mono text-[#88CE11]">shutdown /a</strong> disparado no kernel. Qualquer temporizador ativo de encerramento foi abortado!</span>
          </div>
        </div>
      )}
    </header>
  );
};
