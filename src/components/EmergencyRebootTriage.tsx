import React, { useState } from 'react';
import { FIVE_MINUTE_REBOOT_TRIAGE } from '../data/triageData';
import { DiagnosticItem } from '../types/gama';
import { 
  AlertTriangle, 
  Flame, 
  ShieldCheck, 
  RotateCcw, 
  Play, 
  Copy, 
  Check, 
  Clock, 
  Zap, 
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface EmergencyRebootTriageProps {
  onRunCommand: (title: string, cmd: string, output: string) => void;
}

export const EmergencyRebootTriage: React.FC<EmergencyRebootTriageProps> = ({ onRunCommand }) => {
  const [triageItems, setTriageItems] = useState<DiagnosticItem[]>(FIVE_MINUTE_REBOOT_TRIAGE);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [masterMitigated, setMasterMitigated] = useState(false);
  const [simulatedTemp, setSimulatedTemp] = useState<number>(94.5);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'critical' | 'mitigated'>('all');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunDiagnostic = (item: DiagnosticItem) => {
    setTriageItems(prev =>
      prev.map(i => (i.id === item.id ? { ...i, status: 'testing' } : i))
    );

    setTimeout(() => {
      setTriageItems(prev =>
        prev.map(i => (i.id === item.id ? { ...i, status: 'detected' } : i))
      );
      onRunCommand(`Diagnóstico: ${item.title}`, item.diagnosticCommand, item.simulatedOutput);
    }, 700);
  };

  const handleApplyFix = (item: DiagnosticItem) => {
    setTriageItems(prev =>
      prev.map(i => (i.id === item.id ? { ...i, status: 'mitigated' } : i))
    );
    if (item.id === 'triage-thermal-trip') {
      setSimulatedTemp(68.2); // Cools down!
    }
    onRunCommand(`Contenção: ${item.title}`, item.emergencyFixCommand, item.fixOutput);
  };

  const handleRollback = (item: DiagnosticItem) => {
    setTriageItems(prev =>
      prev.map(i => (i.id === item.id ? { ...i, status: 'idle' } : i))
    );
    if (item.id === 'triage-thermal-trip') {
      setSimulatedTemp(92.0);
    }
    onRunCommand(`Rollback: ${item.title}`, item.rollbackCommand, `[ROLLBACK] Parâmetros revertidos para o estado original do Windows.`);
  };

  const handleMasterRescue = () => {
    // Master emergency triage: runs shutdown -a, disables autoreboot, sets cpu 85%, disables fast startup
    setMasterMitigated(true);
    setSimulatedTemp(66.4);
    setTriageItems(prev => prev.map(i => ({ ...i, status: 'mitigated' })));

    const masterScript = `shutdown /a
reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\CrashControl" /v AutoReboot /t REG_DWORD /d 0 /f
powercfg -setacvalueindex scheme_current sub_processor PROCPERFMAX 85
powercfg.exe -h off
powercfg /setactive scheme_current`;

    const masterOutput = `[+] EXECUTANDO PROTOCOLO DE SALVAMENTO DE EMERGENCIA (ZERO QUEDAS)...
[1/4] shutdown -a executado -> Temporizador cancelado com sucesso.
[2/4] CrashControl\\AutoReboot setado para 0 -> Telas azuis nao reiniciarao o PC.
[3/4] Teto da CPU travado em 85% -> Temperatura caindo de 94.5C para 66.4C.
[4/4] Fast Startup purgado -> Kernel hibernation loop destruido.
[SUCCESS] Maquina blindada contra reinicio em 5 minutos. Pode operar com seguranca.`;

    onRunCommand('Protocolo de Salvamento Mestre (Anti-Reboot 5min)', masterScript, masterOutput);
  };

  const filteredItems = triageItems.filter(item => {
    if (activeTabFilter === 'critical') return item.probability.includes('Crítica');
    if (activeTabFilter === 'mitigated') return item.status === 'mitigated';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Critical Field Scenario Overview */}
      <div className="bg-[#272727] border border-[#52525B] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Triagem Crítica: Máquina Reiniciando a Cada 5 Minutos
              </h2>
            </div>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Em computadores &quot;virgens&quot; ou recém-ligados em bancada, 95% dos reinícios em intervalos fixos de 3 a 5 minutos decorrem de:
              <strong className="text-white"> Disparo térmico da CPU (TJMax)</strong>,
              <strong className="text-white"> CrashControl AutoReboot em tela azul oculta</strong>, ou
              <strong className="text-white"> Temporizador do Windows Update / Fast Startup corrompido</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#A1A1AA] pt-1">
              <span>Alvo: Windows 10 &amp; 11 64-bit</span>
              <span>·</span>
              <span>Privilégio: NT AUTHORITY\SYSTEM / Admin</span>
              <span>·</span>
              <span>Comandos 100% Nativos (Sem utilitários de terceiros)</span>
            </div>
          </div>

          {/* Master Rescue CTA */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col gap-2">
            <button
              onClick={handleMasterRescue}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#88CE11] text-[#161616] font-bold text-sm hover:bg-[#9deb17] active:scale-95 transition-all shadow-md cursor-pointer whitespace-nowrap"
            >
              <Zap className="w-4 h-4 fill-current text-[#161616]" />
              <span>{masterMitigated ? 'CONTENÇÃO MESTRE ATIVA (RE-APLICAR)' : 'DISPARAR SALVAMENTO MESTRE (1-CLIQUE)'}</span>
            </button>
            <span className="text-[11px] text-[#A1A1AA] text-center">
              Aplica shutdown -a, trava CPU em 85% e desativa AutoReboot
            </span>
          </div>
        </div>

        {/* Live Thermal & Watchdog Telemetry Bar */}
        <div className="mt-5 pt-4 border-t border-[#52525B]/40 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#161616] p-3 rounded-lg border border-[#52525B]/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Flame className={`w-5 h-5 ${simulatedTemp > 85 ? 'text-rose-500 animate-pulse' : 'text-[#88CE11]'}`} />
              <div>
                <div className="text-xs text-[#A1A1AA]">Sensor Térmico CPU (ACPI)</div>
                <div className="text-lg font-bold font-mono tabular-nums text-white">
                  {simulatedTemp.toFixed(1)}°C
                </div>
              </div>
            </div>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
              simulatedTemp > 85
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-[#88CE11]/20 text-[#88CE11] border border-[#88CE11]/30'
            }`}>
              {simulatedTemp > 85 ? 'PERIGO TJMAX' : 'ESTÁVEL'}
            </span>
          </div>

          <div className="bg-[#161616] p-3 rounded-lg border border-[#52525B]/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-sky-400" />
              <div>
                <div className="text-xs text-[#A1A1AA]">Interceptador de Timeout</div>
                <div className="text-lg font-bold font-mono text-white">
                  {masterMitigated ? 'ATIVO (BLOQUEADO)' : 'SUSPENDENDO'}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded border border-sky-400/20">
              loop 2s
            </span>
          </div>

          <div className="bg-[#161616] p-3 rounded-lg border border-[#52525B]/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#88CE11]" />
              <div>
                <div className="text-xs text-[#A1A1AA]">Estado de CrashControl</div>
                <div className="text-lg font-bold font-mono text-white">
                  {masterMitigated ? 'AutoReboot = 0' : 'Aguardando'}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[#88CE11] bg-[#88CE11]/10 px-2 py-0.5 rounded border border-[#88CE11]/20">
              DUMP ATIVO
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-[#272727] rounded-lg border border-[#52525B]/50">
          <button
            onClick={() => setActiveTabFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTabFilter === 'all'
                ? 'bg-[#161616] text-[#88CE11] shadow-sm font-semibold'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Todos os 5 Cenários de Falha
          </button>
          <button
            onClick={() => setActiveTabFilter('critical')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTabFilter === 'critical'
                ? 'bg-[#161616] text-[#88CE11] shadow-sm font-semibold'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Apenas Críticos (80%+)
          </button>
          <button
            onClick={() => setActiveTabFilter('mitigated')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTabFilter === 'mitigated'
                ? 'bg-[#161616] text-[#88CE11] shadow-sm font-semibold'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Mitigados ({triageItems.filter(i => i.status === 'mitigated').length})
          </button>
        </div>

        <div className="text-xs text-[#A1A1AA] hidden sm:block">
          Mostrando {filteredItems.length} de {triageItems.length} diagnósticos de bancada
        </div>
      </div>

      {/* Triage Cards Grid */}
      <div className="space-y-4">
        {filteredItems.map(item => {
          const isMitigated = item.status === 'mitigated';
          const isDetected = item.status === 'detected';
          const isTesting = item.status === 'testing';

          return (
            <div
              key={item.id}
              className={`bg-[#272727] border rounded-xl p-5 transition-all shadow-md ${
                isMitigated
                  ? 'border-[#88CE11]/40 bg-[#272727]'
                  : isDetected
                  ? 'border-rose-500/40'
                  : 'border-[#52525B]'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-white tracking-tight">
                      {item.title}
                    </h3>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                      item.probability.includes('Crítica')
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}>
                      {item.probability}
                    </span>
                    {isMitigated && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#88CE11]/20 text-[#88CE11] border border-[#88CE11]/40 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        CONTENÇÃO ATIVA
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    <strong className="text-neutral-300">Causa Provável:</strong> {item.suspectCause}
                  </p>
                  <p className="text-xs text-[#A1A1AA]">
                    <strong className="text-neutral-300">Comportamento de Campo:</strong> {item.timeframe}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto justify-end">
                  <button
                    onClick={() => handleRunDiagnostic(item)}
                    disabled={isTesting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#161616] text-white border border-[#52525B] hover:border-[#88CE11] transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-sky-400" />
                    <span>{isTesting ? 'Consultando...' : 'Diagnosticar'}</span>
                  </button>

                  <button
                    onClick={() => handleApplyFix(item)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#88CE11] text-[#161616] hover:bg-[#9deb17] transition-all shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>{isMitigated ? 'Re-Aplicar Contenção' : 'Aplicar Contenção'}</span>
                  </button>

                  {isMitigated && (
                    <button
                      onClick={() => handleRollback(item)}
                      title="Reverter alteração para o estado padrão do Windows"
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[#161616] text-[#A1A1AA] hover:text-white border border-[#52525B] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Rollback</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Code Snippet and Commands Preview */}
              <div className="mt-4 pt-3 border-t border-[#52525B]/40 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Diagnostic Command */}
                <div className="bg-[#161616] p-3 rounded-lg border border-[#52525B]/40">
                  <div className="flex items-center justify-between text-[#A1A1AA] mb-1.5">
                    <span className="font-semibold text-neutral-300">Comando de Diagnóstico Nativo:</span>
                    <button
                      onClick={() => copyToClipboard(item.diagnosticCommand, `diag-${item.id}`)}
                      className="hover:text-white flex items-center gap-1"
                      title="Copiar comando PowerShell"
                    >
                      {copiedId === `diag-${item.id}` ? (
                        <Check className="w-3 h-3 text-[#88CE11]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copiar</span>
                    </button>
                  </div>
                  <pre className="font-mono text-[11px] text-[#88CE11] overflow-x-auto whitespace-pre-wrap select-all">
                    {item.diagnosticCommand}
                  </pre>
                </div>

                {/* Fix Command */}
                <div className="bg-[#161616] p-3 rounded-lg border border-[#52525B]/40">
                  <div className="flex items-center justify-between text-[#A1A1AA] mb-1.5">
                    <span className="font-semibold text-neutral-300">Comando de Contenção Imediata:</span>
                    <button
                      onClick={() => copyToClipboard(item.emergencyFixCommand, `fix-${item.id}`)}
                      className="hover:text-white flex items-center gap-1"
                      title="Copiar comando de contenção"
                    >
                      {copiedId === `fix-${item.id}` ? (
                        <Check className="w-3 h-3 text-[#88CE11]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copiar</span>
                    </button>
                  </div>
                  <pre className="font-mono text-[11px] text-sky-400 overflow-x-auto whitespace-pre-wrap select-all">
                    {item.emergencyFixCommand}
                  </pre>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
