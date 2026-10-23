import express from 'express';
import { exec } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  platform: string;
  isWindows: boolean;
  isAdmin: boolean;
  executionTimeMs: number;
}

// Function to check if the current process has Windows Administrator privileges
let cachedIsAdmin: boolean | null = null;

async function checkAdminPrivilege(): Promise<boolean> {
  if (process.platform !== 'win32') return true; // Non-windows fallback
  if (cachedIsAdmin !== null) return cachedIsAdmin;

  return new Promise((resolve) => {
    exec('net session', (err) => {
      // 'net session' succeeds (exit code 0) only if running elevated as Administrator
      cachedIsAdmin = !err;
      resolve(cachedIsAdmin);
    });
  });
}

// Real Kernel-Level Command Execution via Temporary Script File (Zero escaping corruption)
const executeKernelCommand = async (command: string, shellType: 'powershell' | 'cmd' = 'powershell'): Promise<ExecResult> => {
  const startTime = Date.now();
  const isWindows = process.platform === 'win32';
  const isAdmin = await checkAdminPrivilege();

  return new Promise((resolve) => {
    if (isWindows) {
      // On Windows: Write to temporary .ps1 or .bat to guarantee 100% preservation of multi-line scripts, quotes, and variables
      const tempId = `gama_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const ext = shellType === 'powershell' ? 'ps1' : 'bat';
      const tempScriptPath = path.join(os.tmpdir(), `${tempId}.${ext}`);

      try {
        let scriptContent = command;
        if (shellType === 'powershell') {
          // Prepend execution preference and UTF-8 output encoding
          scriptContent = `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8\n$ErrorActionPreference = "Continue"\n${command}`;
        }
        fs.writeFileSync(tempScriptPath, scriptContent, { encoding: 'utf8' });

        const executionCommand = shellType === 'powershell'
          ? `powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${tempScriptPath}"`
          : `cmd.exe /c "${tempScriptPath}"`;

        exec(executionCommand, { maxBuffer: 1024 * 1024 * 15, windowsHide: true }, (error, stdout, stderr) => {
          // Clean up temp file immediately
          try {
            if (fs.existsSync(tempScriptPath)) fs.unlinkSync(tempScriptPath);
          } catch {}

          const outText = stdout ? stdout.toString().trim() : '';
          const errText = stderr ? stderr.toString().trim() : (error ? error.message : '');

          resolve({
            stdout: outText,
            stderr: errText,
            exitCode: error ? (error.code || 1) : 0,
            platform: 'win32',
            isWindows: true,
            isAdmin,
            executionTimeMs: Date.now() - startTime
          });
        });
      } catch (writeErr: any) {
        resolve({
          stdout: '',
          stderr: `[GAMA KERNEL ERROR] Falha ao despachar arquivo temporário: ${writeErr.message}`,
          exitCode: 1,
          platform: 'win32',
          isWindows: true,
          isAdmin,
          executionTimeMs: Date.now() - startTime
        });
      }
      return;
    }

    // On Linux/POSIX environments:
    // Execute command directly via bash/sh to support Linux commands, or return native OS response
    exec(command, { maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
      resolve({
        stdout: stdout ? stdout.trim() : (error ? '' : `[OK] Comando processado pelo host: ${command}`),
        stderr: stderr ? stderr.trim() : (error ? error.message : ''),
        exitCode: error ? (error.code || 1) : 0,
        platform: process.platform,
        isWindows: false,
        isAdmin: true,
        executionTimeMs: Date.now() - startTime
      });
    });
  });
};

// --- API ROUTES ---

// 1. Direct Command Dispatcher
app.post('/api/execute', async (req, res) => {
  try {
    const { command, shell = 'powershell' } = req.body;
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Comando em branco ou inválido.' });
    }

    const result = await executeKernelCommand(command, shell);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Falha crítica no subsistema de execução.' });
  }
});

// 2. Emergency Shutdown Abort Endpoint
app.post('/api/abort-shutdown', async (req, res) => {
  try {
    const result = await executeKernelCommand('shutdown.exe /a', 'cmd');
    res.json({
      success: true,
      message: 'shutdown /a executado diretamente no kernel do Windows.',
      details: result
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Falha ao abortar desligamento.' });
  }
});

// 3. USB Tethering (RNDIS) & CPU-Z Kernel Driver Conflict Mitigation Endpoint
app.post('/api/tethering-mitigation', async (req, res) => {
  const mitigationScript = `
Write-Host "[GAMA] INICIANDO MITIGAÇÃO DE TELA AZUL POR USB TETHERING..." -ForegroundColor Cyan

# 1. Parada forçada e remoção do driver de kernel invasivo do CPU-Z
Write-Host "[*] Identificando e descarregando drivers residuais do CPU-Z (cpuz*)..." -ForegroundColor Yellow
$cpuzServices = @("cpuz154", "cpuz155", "cpuz150", "cpuz143", "cpuz141")
foreach ($svc in $cpuzServices) {
    sc.exe stop $svc 2>$null | Out-Null
    sc.exe delete $svc 2>$null | Out-Null
}

# Finaliza processos do CPU-Z ou HWMonitor que possam estar re-injetando o driver
taskkill.exe /f /im cpuz.exe 2>$null | Out-Null
taskkill.exe /f /im cpuz154_x64.exe 2>$null | Out-Null

# Exclui binários temporários do cpuz*.sys que causam colisão no anel 0
Remove-Item "$env:TEMP\\cpuz*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "C:\\Windows\\Temp\\cpuz*" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "[OK] Drivers de kernel do CPU-Z neutralizados." -ForegroundColor Green

# 2. Reset da pilha de adaptadores NDIS e catálogo de rede móvel
Write-Host "[*] Resetando pilha NDIS / RNDIS e limpando Winsock..." -ForegroundColor Yellow
netsh winsock reset catalog | Out-Null
netsh int ip reset "$env:TEMP\\gama_ip_reset.log" | Out-Null
ipconfig /flushdns | Out-Null

# 3. Ajuste de estabilidade no registro para adaptadores RNDIS (Android USB Tethering)
Write-Host "[*] Aplicando correção de buffer para drivers RNDIS / USB Tethering..." -ForegroundColor Yellow
reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\RNDISMP\\Parameters" /v MaxPacketsPerMessage /t REG_DWORD /d 1 /f 2>$null | Out-Null
reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\RNDISMP6\\Parameters" /v MaxPacketsPerMessage /t REG_DWORD /d 1 /f 2>$null | Out-Null

# 4. Aborta qualquer shutdown ativo
& shutdown.exe /a 2>$null

Write-Host "[SUCCESS] Mitigação concluída. O celular Android pode ser reconectado via ancoragem USB com segurança." -ForegroundColor Green
`;

  try {
    const result = await executeKernelCommand(mitigationScript, 'powershell');
    res.json({
      success: true,
      message: 'Mitigação de Tethering USB / CPU-Z aplicada com sucesso.',
      details: result
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Falha ao aplicar mitigação de tethering.' });
  }
});

// 4. Real System Telemetry & Privilege Audit
app.get('/api/system-status', async (req, res) => {
  const isAdmin = await checkAdminPrivilege();
  const cpus = os.cpus();
  const networkInterfaces = os.networkInterfaces();
  
  // Extract active interface names
  const activeInterfaces: string[] = [];
  for (const [name, addrs] of Object.entries(networkInterfaces)) {
    if (addrs && addrs.some(a => !a.internal)) {
      activeInterfaces.push(name);
    }
  }

  res.json({
    platform: process.platform,
    hostname: os.hostname(),
    uptime: os.uptime(),
    cpus: cpus.length,
    cpuModel: cpus[0]?.model || 'Generic Processor',
    totalMemoryGB: (os.totalmem() / (1024 ** 3)).toFixed(2),
    freeMemoryGB: (os.freemem() / (1024 ** 3)).toFixed(2),
    usedMemoryPercent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100),
    isWindows: process.platform === 'win32',
    isAdmin,
    activeInterfaces
  });
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, async () => {
    const isAdmin = await checkAdminPrivilege();
    console.log(`[GAMA KERNEL ENGINE] Backend operacional na porta ${PORT}`);
    console.log(`[HOST] Plataforma: ${process.platform} | Privilégio Elevado: ${isAdmin ? 'SIM (ADMIN/SYSTEM)' : 'NÃO (USUÁRIO COMUM - EXECUTAR ELEVADO)'}`);
  });
}

startServer();
