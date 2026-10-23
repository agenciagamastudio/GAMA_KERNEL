import React, { useState } from 'react';
import { GAMA_TERMINAL_MACETES } from '../data/commandsData';
import { TerminalCommand } from '../types/gama';
import { 
  Search, 
  Copy, 
  Check, 
  Play, 
  Terminal, 
  ShieldAlert, 
  Info, 
  Lightbulb,
  Wifi,
  HardDrive,
  Cpu,
  Settings,
  Activity,
  Layers
} from 'lucide-react';

interface TerminalHubProps {
  onRunInConsole: (title: string, cmd: string, output: string) => void;
}

export const TerminalHub: React.FC<TerminalHubProps> = ({ onRunInConsole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Todos os Macetes', icon: Terminal },
    { id: 'Hardware & Térmico', label: 'Hardware & Térmico', icon: Cpu },
    { id: 'Rede & TCP/IP', label: 'Rede & TCP/IP', icon: Wifi },
    { id: 'Disco & Arquivos', label: 'Disco & Arquivos', icon: HardDrive },
    { id: 'Registro & Tweaks', label: 'Registro & Tweaks', icon: Settings },
    { id: 'Processos & Watchdogs', label: 'Processos & Watchdogs', icon: Activity },
    { id: 'Windows 11 OOBE/Bypass', label: 'Windows 11 OOBE/Bypass', icon: Layers }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulate = (item: TerminalCommand) => {
    const simulatedResponse = `[NT AUTHORITY\\SYSTEM] Invocando comando cirúrgico...
PS C:\\Windows\\system32> ${item.command}
[STATUS] Código de saída: 0 (Sucesso).
[INFO GAMA] ${item.practicalTip}`;

    onRunInConsole(item.title, item.command, simulatedResponse);
  };

  const filteredCommands = GAMA_TERMINAL_MACETES.filter(cmd => {
    const matchesCategory = selectedCategory === 'all' || cmd.category === selectedCategory;
    const matchesSearch =
      cmd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.practicalTip.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search & Header Strip */}
      <div className="bg-[#272727] border border-[#52525B] rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Repositório Interno de Macetes &amp; Comandos Nativos de Terminal
            </h2>
            <p className="text-sm text-[#A1A1AA]">
              O canivete suíço definitivo para assistência técnica em campo: comandos puros do Windows (sem downloads ou instaladores).
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por wifi, temperatura, tpm, sfc..."
              className="w-full bg-[#161616] border border-[#52525B] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#88CE11]"
            />
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-[#52525B]/40">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#88CE11] text-[#161616] font-bold shadow-sm'
                    : 'bg-[#161616] text-[#A1A1AA] hover:text-white border border-[#52525B]/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Commands Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCommands.length === 0 ? (
          <div className="bg-[#272727] border border-[#52525B] rounded-xl p-8 text-center text-[#A1A1AA]">
            Nenhum comando encontrado para o filtro &quot;{searchTerm}&quot;.
          </div>
        ) : (
          filteredCommands.map(cmd => {
            const isCopied = copiedId === cmd.id;

            return (
              <div
                key={cmd.id}
                className="bg-[#272727] border border-[#52525B] hover:border-[#88CE11]/50 rounded-xl p-5 shadow-md transition-all group"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-[#88CE11] bg-[#161616] px-2 py-0.5 rounded border border-[#52525B]/50">
                        {cmd.category}
                      </span>
                      {cmd.elevation && (
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          REQUER ADMIN
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-[#88CE11] transition-colors">
                      {cmd.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
                    <button
                      onClick={() => handleSimulate(cmd)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#161616] text-white border border-[#52525B] hover:border-[#88CE11] transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 text-[#88CE11]" />
                      <span>Simular Execução</span>
                    </button>

                    <button
                      onClick={() => handleCopy(cmd.command, cmd.id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#88CE11] text-[#161616] hover:bg-[#9deb17] transition-all shadow-sm cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#A1A1AA] leading-relaxed mb-3">
                  {cmd.description}
                </p>

                {/* Command Shell Box */}
                <div className="relative bg-[#161616] rounded-lg border border-[#52525B]/60 p-3 font-mono text-xs text-[#88CE11] overflow-x-auto select-all">
                  <code>{cmd.command}</code>
                </div>

                {/* Technician Practical Tip */}
                <div className="mt-3 pt-3 border-t border-[#52525B]/40 flex items-start gap-2 text-xs text-neutral-300">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong className="text-amber-300 font-medium">Macete de Bancada:</strong> {cmd.practicalTip}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
