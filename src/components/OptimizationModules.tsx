import React, { useState } from 'react';
import { GAMA_OPTIMIZATION_MODULES } from '../data/modulesData';
import { OptimizationModule } from '../types/gama';
import { 
  Play, 
  RotateCcw, 
  Code, 
  FileCode, 
  Layers, 
  Copy, 
  Check, 
  Download, 
  Shield, 
  CheckCircle2,
  Terminal,
  Filter
} from 'lucide-react';

interface OptimizationModulesProps {
  onRunScript: (moduleName: string, script: string, isRollback?: boolean) => Promise<any>;
}

export const OptimizationModules: React.FC<OptimizationModulesProps> = ({ onRunScript }) => {
  const [modules, setModules] = useState<OptimizationModule[]>(GAMA_OPTIMIZATION_MODULES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeBlockView, setActiveBlockView] = useState<{ [moduleId: string]: 'ui' | 'json' | 'script' }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [executingModuleId, setExecutingModuleId] = useState<string | null>(null);

  const categories = [
    'all',
    'Kernel & Crash',
    'Thermal & Power',
    'Telemetry & Privacy',
    'Storage & Integrity',
    'Network',
    'Latency & Gaming'
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleApply = async (mod: OptimizationModule) => {
    setExecutingModuleId(mod.id);
    try {
      const res = await onRunScript(mod.module_name, mod.executable_script, false);
      const out = res?.stdout || res?.stderr || 'Módulo executado com êxito no kernel.';
      setModules(prev =>
        prev.map(m => (m.id === mod.id ? { ...m, applied: true, lastExecutionOutput: out, lastExecutionError: res?.stderr } : m))
      );
    } catch (err: any) {
      setModules(prev =>
        prev.map(m => (m.id === mod.id ? { ...m, lastExecutionError: err.message } : m))
      );
    } finally {
      setExecutingModuleId(null);
    }
  };

  const handleRollback = async (mod: OptimizationModule) => {
    setExecutingModuleId(mod.id);
    try {
      const res = await onRunScript(mod.module_name, mod.rollback_script, true);
      const out = res?.stdout || res?.stderr || 'Rollback aplicado com êxito.';
      setModules(prev =>
        prev.map(m => (m.id === mod.id ? { ...m, applied: false, lastExecutionOutput: out, lastExecutionError: res?.stderr } : m))
      );
    } catch (err: any) {
      setModules(prev =>
        prev.map(m => (m.id === mod.id ? { ...m, lastExecutionError: err.message } : m))
      );
    } finally {
      setExecutingModuleId(null);
    }
  };

  const filteredModules = modules.filter(
    m => selectedCategory === 'all' || m.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Overview & Instructions Header */}
      <div className="bg-[#272727] border border-[#52525B] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Módulos de Otimização &amp; Engenharia Reversa GAMA
            </h2>
            <p className="text-sm text-[#A1A1AA]">
              Payloads industriais cirúrgicos com garantia de Rollback 1 para 1. Cada módulo gera os 3 blocos obrigatórios:
              <span className="text-white font-mono text-xs ml-1">Payload JSON</span>,
              <span className="text-white font-mono text-xs ml-1">Script Auto-Executável</span> e
              <span className="text-white font-mono text-xs ml-1">Painel GAMA UI</span>.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#A1A1AA] bg-[#161616] px-3 py-1.5 rounded-lg border border-[#52525B]">
            <Shield className="w-4 h-4 text-[#88CE11]" />
            <span>Módulos Ativos: <strong className="text-white font-mono">{modules.filter(m => m.applied).length}/{modules.length}</strong></span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-4 pt-4 border-t border-[#52525B]/40 flex items-center gap-1.5 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-[#A1A1AA] shrink-0 mr-1" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#88CE11] text-[#161616] font-bold shadow-sm'
                  : 'bg-[#161616] text-[#A1A1AA] hover:text-white border border-[#52525B]/50'
              }`}
            >
              {cat === 'all' ? 'Todos os Módulos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        {filteredModules.map(mod => {
          const currentView = activeBlockView[mod.id] || 'ui';
          const isApplied = !!mod.applied;
          const isBusy = executingModuleId === mod.id;

          // Build JSON Payload for Block 1
          const jsonPayload = {
            module_name: mod.module_name,
            target_windows_versions: mod.target_windows_versions,
            require_reboot: mod.require_reboot,
            optimization_payload: mod.optimization_payload,
            rollback_payload: mod.rollback_payload
          };

          return (
            <div
              key={mod.id}
              className={`bg-[#272727] border rounded-xl overflow-hidden shadow-lg transition-all ${
                isApplied ? 'border-[#88CE11]/50 shadow-[#88CE11]/5' : 'border-[#52525B]'
              }`}
            >
              {/* Card Header & Block Tabs */}
              <div className="px-5 py-4 border-b border-[#52525B]/50 bg-[#222222] flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isApplied ? 'bg-[#88CE11] shadow-[0_0_8px_#88CE11]' : 'bg-[#52525B]'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#88CE11] font-semibold">{mod.module_name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#161616] text-[#A1A1AA] rounded border border-[#52525B]/40">
                        Win {mod.target_windows_versions.join('/')}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">{mod.title}</h3>
                  </div>
                </div>

                {/* 3 Blocks Segmented View Switcher */}
                <div className="flex items-center gap-1 p-1 bg-[#161616] rounded-lg border border-[#52525B]/60 self-start md:self-auto">
                  <button
                    onClick={() => setActiveBlockView(prev => ({ ...prev, [mod.id]: 'ui' }))}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      currentView === 'ui'
                        ? 'bg-[#272727] text-white font-semibold'
                        : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-[#88CE11]" />
                    <span>[BLOCO 3] UI Card</span>
                  </button>

                  <button
                    onClick={() => setActiveBlockView(prev => ({ ...prev, [mod.id]: 'json' }))}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      currentView === 'json'
                        ? 'bg-[#272727] text-white font-semibold'
                        : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5 text-sky-400" />
                    <span>[BLOCO 1] JSON Payload</span>
                  </button>

                  <button
                    onClick={() => setActiveBlockView(prev => ({ ...prev, [mod.id]: 'script' }))}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      currentView === 'script'
                        ? 'bg-[#272727] text-white font-semibold'
                        : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 text-amber-400" />
                    <span>[BLOCO 2] Script PS1</span>
                  </button>
                </div>
              </div>

              {/* Card Body - Content based on active block */}
              <div className="p-5">
                {currentView === 'ui' && (
                  /* BLOCO 3: GAMA CONTROL PANEL UI (HTML / TAILWIND) */
                  <div className="space-y-4">
                    <p className="text-sm text-[#A1A1AA] leading-relaxed">
                      {mod.description}
                    </p>

                    {/* Technical details strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-[#161616] p-2.5 rounded-lg border border-[#52525B]/40">
                        <span className="text-[#A1A1AA] block text-[11px]">Nível de Risco:</span>
                        <span className="font-semibold text-white">{mod.risk_level}</span>
                      </div>
                      <div className="bg-[#161616] p-2.5 rounded-lg border border-[#52525B]/40">
                        <span className="text-[#A1A1AA] block text-[11px]">Requer Reinicialização:</span>
                        <span className="font-mono text-white">{mod.require_reboot ? 'Sim (Reboot Agendado)' : 'Não (Imediato)'}</span>
                      </div>
                      <div className="bg-[#161616] p-2.5 rounded-lg border border-[#52525B]/40">
                        <span className="text-[#A1A1AA] block text-[11px]">Chaves de Registro / Serviços:</span>
                        <span className="font-mono text-[#88CE11] font-semibold">{mod.optimization_payload.length} itens mapeados</span>
                      </div>
                    </div>

                    {/* Realtime Execution Terminal Box */}
                    <div className="bg-[#161616] rounded-lg border border-[#52525B]/50 p-3 font-mono text-xs">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#52525B]/30 text-[#A1A1AA] text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <Terminal className="w-3 h-3 text-[#88CE11]" />
                          <span>Console de Execução Industrial GAMA</span>
                        </span>
                        <span className="text-[10px] text-neutral-400">NT AUTHORITY\SYSTEM</span>
                      </div>
                      <div className="space-y-1 text-neutral-300 text-[11px] leading-relaxed">
                        {mod.lastExecutionOutput ? (
                          <pre className="text-[#88CE11] whitespace-pre-wrap select-all font-mono max-h-36 overflow-y-auto">
                            {mod.lastExecutionOutput}
                          </pre>
                        ) : isApplied ? (
                          <>
                            <p className="text-[#88CE11]">[OK] {mod.module_name}: OTIMIZAÇÃO GRAVADA NO KERNEL.</p>
                            <p className="text-neutral-400">&gt; Backup mantido para rollback 1:1 imediato.</p>
                          </>
                        ) : (
                          <p className="text-neutral-400">&gt; Estado do sistema: PADRÃO DO WINDOWS (Pronto para execução direta).</p>
                        )}
                        {mod.lastExecutionError && (
                          <pre className="text-rose-400 whitespace-pre-wrap select-all font-mono mt-1">
                            [ERRO DO SISTEMA] {mod.lastExecutionError}
                          </pre>
                        )}
                      </div>
                    </div>

                    {/* Master Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        {isApplied ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-[#88CE11]">
                            <CheckCircle2 className="w-4 h-4 text-[#88CE11]" />
                            <span>Módulo Ativo no Kernel</span>
                          </span>
                        ) : (
                          <span className="text-xs text-[#A1A1AA]">
                            Padrão de Fábrica do Windows
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRollback(mod)}
                          disabled={isBusy}
                          className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#161616] text-[#A1A1AA] hover:text-white border border-[#52525B] hover:border-neutral-400 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Rollback 1:1 (Reverter)</span>
                        </button>

                        <button
                          onClick={() => handleApply(mod)}
                          disabled={isBusy}
                          className="px-5 py-2 text-xs font-bold rounded-lg bg-[#88CE11] text-[#161616] hover:bg-[#9deb17] active:scale-95 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isBusy ? 'Aplicando...' : isApplied ? 'Re-Executar Otimização' : 'Aplicar Otimização GAMA'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {currentView === 'json' && (
                  /* BLOCO 1: DATA PAYLOAD (JSON PARSE READY) */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
                      <span>Objeto JSON puro para consumo nativo por backends ou parsers:</span>
                      <button
                        onClick={() => handleCopy(JSON.stringify(jsonPayload, null, 2), `json-${mod.id}`)}
                        className="flex items-center gap-1 text-white hover:text-[#88CE11] font-mono transition-colors"
                      >
                        {copiedKey === `json-${mod.id}` ? <Check className="w-3.5 h-3.5 text-[#88CE11]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copiar JSON</span>
                      </button>
                    </div>

                    <pre className="p-4 bg-[#161616] rounded-lg border border-[#52525B]/50 font-mono text-xs text-[#88CE11] overflow-x-auto max-h-80 leading-relaxed select-all">
                      {JSON.stringify(jsonPayload, null, 2)}
                    </pre>
                  </div>
                )}

                {currentView === 'script' && (
                  /* BLOCO 2: AUTO-EXECUTABLE SCRIPT (POWERSHELL / REG) */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
                      <span>Script PowerShell silencioso e comentado com bloco de Rollback acoplado:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(`${mod.module_name}.ps1`, `${mod.executable_script}\n\n# --- ROLLBACK ---\n${mod.rollback_script}`)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 bg-[#161616] border border-[#52525B] rounded text-white hover:border-[#88CE11] transition-colors"
                        >
                          <Download className="w-3 h-3 text-[#88CE11]" />
                          <span>Baixar .ps1</span>
                        </button>
                        <button
                          onClick={() => handleCopy(mod.executable_script, `script-${mod.id}`)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 bg-[#161616] border border-[#52525B] rounded text-white hover:border-[#88CE11] transition-colors"
                        >
                          {copiedKey === `script-${mod.id}` ? <Check className="w-3 h-3 text-[#88CE11]" /> : <Copy className="w-3 h-3" />}
                          <span>Copiar Script</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <div className="text-[11px] font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          <span>SCRIPT DE APLICAÇÃO (POWERSHELL ELEVADO):</span>
                        </div>
                        <pre className="p-3 bg-[#161616] rounded-lg border border-[#52525B]/50 font-mono text-[11px] text-neutral-200 overflow-x-auto max-h-72 whitespace-pre-wrap select-all">
                          {mod.executable_script}
                        </pre>
                      </div>

                      <div>
                        <div className="text-[11px] font-semibold text-rose-400 mb-1 flex items-center gap-1">
                          <RotateCcw className="w-3 h-3" />
                          <span>SCRIPT DE ROLLBACK IDÊNTICO 1:1:</span>
                        </div>
                        <pre className="p-3 bg-[#161616] rounded-lg border border-[#52525B]/50 font-mono text-[11px] text-[#A1A1AA] overflow-x-auto max-h-72 whitespace-pre-wrap select-all">
                          {mod.rollback_script}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
