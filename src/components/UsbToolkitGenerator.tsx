import React, { useState } from 'react';
import { PORTABLE_KIT_FILES, PortableFile } from '../data/portableScriptsData';
import { 
  Usb, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  FileCode, 
  AlertCircle, 
  CheckCircle2, 
  HardDrive,
  Cpu,
  Layers
} from 'lucide-react';

export const UsbToolkitGenerator: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<PortableFile>(PORTABLE_KIT_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (file: PortableFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    PORTABLE_KIT_FILES.forEach(file => {
      handleDownload(file);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#272727] border border-[#52525B] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-[#88CE11]/20 text-[#88CE11]">
                <Usb className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Gerador de Kit Pendrive Portátil para Máquinas Virgens
              </h2>
            </div>
            <p className="text-sm text-[#A1A1AA]">
              Estrutura pronta para espetar no pendrive e recuperar PCs virgens sem conexão ou em loop de desligamento a cada 5 minutos.
            </p>
          </div>

          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#88CE11] text-[#161616] font-bold text-xs hover:bg-[#9deb17] transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Kit Completo (3 Arquivos)</span>
          </button>
        </div>

        {/* 4 Steps Quick Workflow */}
        <div className="mt-5 pt-4 border-t border-[#52525B]/40 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#161616] p-3 rounded-lg border border-[#52525B]/40 space-y-1">
            <span className="text-[10px] font-mono text-[#88CE11] font-semibold">PASSO 01</span>
            <div className="font-semibold text-white">Copiar para o Pendrive</div>
            <div className="text-[11px] text-[#A1A1AA]">
              Coloque <code className="text-[#88CE11]">GAMA_EMERGENCY_PORTABLE.bat</code> na raiz do pendrive.
            </div>
          </div>

          <div className="bg-[#161616] p-3 rounded-lg border border-[#52525B]/40 space-y-1">
            <span className="text-[10px] font-mono text-[#88CE11] font-semibold">PASSO 02</span>
            <div className="font-semibold text-white">Espetar no PC com Problema</div>
            <div className="text-[11px] text-[#A1A1AA]">
              Com o PC ligado, conecte o pendrive antes que vença o prazo de 5 minutos.
            </div>
          </div>

          <div className="bg-[#161616] p-3 rounded-lg border border-[#52525B]/40 space-y-1">
            <span className="text-[10px] font-mono text-[#88CE11] font-semibold">PASSO 03</span>
            <div className="font-semibold text-white">Executar como Admin</div>
            <div className="text-[11px] text-[#A1A1AA]">
              O script aborta o shutdown na hora, trava a CPU em 85% e anula telas azuis.
            </div>
          </div>

          <div className="bg-[#161616] p-3 rounded-lg border border-[#52525B]/40 space-y-1">
            <span className="text-[10px] font-mono text-[#88CE11] font-semibold">PASSO 04</span>
            <div className="font-semibold text-white">Bootstrap Automático</div>
            <div className="text-[11px] text-[#A1A1AA]">
              Instala Node/Git silencioso e abre este dashboard em http://localhost:3000.
            </div>
          </div>
        </div>
      </div>

      {/* File Viewer Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Selector Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider px-1">
            Arquivos Portáteis Prontos:
          </div>

          <div className="space-y-2">
            {PORTABLE_KIT_FILES.map(file => {
              const isSelected = selectedFile.filename === file.filename;
              return (
                <div
                  key={file.filename}
                  onClick={() => setSelectedFile(file)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#272727] border-[#88CE11] shadow-sm'
                      : 'bg-[#161616] border-[#52525B] hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                      {file.type === 'bat' ? (
                        <FileCode className="w-4 h-4 text-[#88CE11]" />
                      ) : file.type === 'ps1' ? (
                        <Cpu className="w-4 h-4 text-sky-400" />
                      ) : (
                        <FileText className="w-4 h-4 text-amber-400" />
                      )}
                      <span>{file.filename}</span>
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#161616] text-[#A1A1AA] border border-[#52525B]/40">
                      .{file.type}
                    </span>
                  </div>
                  <div className="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">
                    {file.description}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Golden Rules Box */}
          <div className="bg-[#161616] border border-[#52525B] rounded-xl p-4 text-xs text-[#A1A1AA] space-y-2">
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Por que usar Winget + Fallback Curl?</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Em Windows 10 (compilação 1809+) e Windows 11, o comando <code className="text-[#88CE11]">curl.exe</code> e <code className="text-[#88CE11]">tar.exe</code> vêm embutidos nativamente em System32. Mesmo em PCs totalmente sem ferramentas instaladas, o script consegue baixar e descompactar dependências silenciosamente sem precisar de instalador gráfico!
            </p>
          </div>
        </div>

        {/* File Preview & Code Pane */}
        <div className="lg:col-span-8 bg-[#272727] border border-[#52525B] rounded-xl overflow-hidden shadow-lg flex flex-col">
          {/* Header of Code Pane */}
          <div className="px-5 py-3.5 bg-[#202020] border-b border-[#52525B]/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-white">
                {selectedFile.filename}
              </span>
              <span className="text-[11px] text-[#A1A1AA] hidden sm:inline">
                ({selectedFile.title})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(selectedFile.content)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161616] text-white border border-[#52525B] hover:border-[#88CE11] text-xs font-medium transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#88CE11]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>

              <button
                onClick={() => handleDownload(selectedFile)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#88CE11] text-[#161616] text-xs font-bold hover:bg-[#9deb17] transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar .{selectedFile.type}</span>
              </button>
            </div>
          </div>

          {/* Code Body */}
          <div className="p-4 bg-[#161616] flex-1 overflow-x-auto">
            <pre className="font-mono text-xs text-[#88CE11] leading-relaxed whitespace-pre select-all">
              {selectedFile.content}
            </pre>
          </div>

          {/* Footer with execution instructions */}
          <div className="px-5 py-3 bg-[#202020] border-t border-[#52525B]/40 text-xs text-[#A1A1AA] flex items-center justify-between">
            <span>Privilégio Necessário: <strong>Administrador (UAC Automático)</strong></span>
            <span className="font-mono text-[11px] text-white">
              {selectedFile.content.split('\n').length} linhas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
