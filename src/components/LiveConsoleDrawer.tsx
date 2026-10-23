import React, { useState, useRef, useEffect } from 'react';
import { LogEntry } from '../types/gama';
import { 
  Terminal, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Copy, 
  Check, 
  Send, 
  Maximize2, 
  Minimize2,
  Shield
} from 'lucide-react';

interface LiveConsoleDrawerProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  onRunCustomCommand: (cmd: string) => void;
}

export const LiveConsoleDrawer: React.FC<LiveConsoleDrawerProps> = ({
  logs,
  onClearLogs,
  onRunCustomCommand
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  const handleCopy = () => {
    const text = logs.map(l => `[${l.timestamp}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    onRunCustomCommand(commandInput.trim());
    setCommandInput('');
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-[#161616] border-t border-[#52525B] shadow-2xl transition-all duration-200 flex flex-col ${
        !isOpen ? 'h-10' : isExpanded ? 'h-96' : 'h-64'
      }`}
    >
      {/* Drawer Header Bar */}
      <div className="bg-[#272727] px-4 py-2 flex items-center justify-between border-b border-[#52525B]/40 shrink-0 select-none">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 cursor-pointer text-xs font-mono font-semibold text-white hover:text-[#88CE11] transition-colors"
        >
          <Terminal className="w-4 h-4 text-[#88CE11]" />
          <span>CONSOLE DE EXECUÇÃO KERNEL GAMA</span>
          <span className="text-[10px] text-[#A1A1AA] font-normal hidden sm:inline">
            (PowerShell / CMD Elevado)
          </span>
          <span className="text-[10px] bg-[#161616] px-1.5 py-0.2 rounded text-[#88CE11] border border-[#52525B]/50">
            {logs.length} logs
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isOpen && (
            <>
              <button
                onClick={handleCopy}
                title="Copiar histórico de logs"
                className="p-1.5 text-[#A1A1AA] hover:text-white rounded hover:bg-[#161616] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#88CE11]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onClearLogs}
                title="Limpar console"
                className="p-1.5 text-[#A1A1AA] hover:text-white rounded hover:bg-[#161616] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restaurar altura' : 'Expandir'}
                className="p-1.5 text-[#A1A1AA] hover:text-white rounded hover:bg-[#161616] transition-colors hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            title={isOpen ? 'Recolher console' : 'Expandir console'}
            className="p-1.5 text-[#A1A1AA] hover:text-white rounded hover:bg-[#161616] transition-colors"
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      {isOpen && (
        <>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1.5 select-text">
            {logs.map(log => {
              const colorClass =
                log.type === 'success'
                  ? 'text-[#88CE11]'
                  : log.type === 'cmd'
                  ? 'text-sky-400 font-semibold'
                  : log.type === 'warning'
                  ? 'text-amber-400'
                  : log.type === 'error'
                  ? 'text-rose-400'
                  : 'text-neutral-300';

              return (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-[#A1A1AA] text-[10px] shrink-0 tabular-nums">
                    [{log.timestamp}]
                  </span>
                  <div className={`whitespace-pre-wrap break-all ${colorClass}`}>
                    {log.text}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Interactive Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-2 bg-[#202020] border-t border-[#52525B]/40 flex items-center gap-2 shrink-0"
          >
            <div className="flex items-center gap-1.5 pl-2 text-xs font-mono text-[#88CE11] shrink-0 select-none">
              <Shield className="w-3.5 h-3.5 text-[#88CE11]" />
              <span>PS C:\&gt;</span>
            </div>
            <input
              type="text"
              value={commandInput}
              onChange={e => setCommandInput(e.target.value)}
              placeholder="Digite um comando (ex: shutdown /a, powercfg -h off, sfc /scannow)..."
              className="flex-1 bg-[#161616] border border-[#52525B] rounded px-3 py-1 text-xs text-white placeholder-[#A1A1AA] font-mono focus:outline-none focus:border-[#88CE11]"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-[#88CE11] text-[#161616] font-bold text-xs rounded hover:bg-[#9deb17] transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>Executar</span>
            </button>
          </form>
        </>
      )}
    </div>
  );
};
