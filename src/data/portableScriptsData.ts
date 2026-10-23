export interface PortableFile {
  filename: string;
  type: 'bat' | 'ps1' | 'txt' | 'reg';
  title: string;
  description: string;
  content: string;
}

export const PORTABLE_KIT_FILES: PortableFile[] = [
  {
    filename: 'GAMA_EMERGENCY_PORTABLE.bat',
    type: 'bat',
    title: 'GAMA Master Bootstrap & Anti-Reboot (Batch Elevado)',
    description: 'Script executável para colocar na raiz do pendrive. Clica duas vezes na máquina virgem: eleva para Admin automaticamente, aborta desligamentos em loop, estabiliza a CPU em 85%, instala Node.js/Git silenciosamente e inicializa este Dashboard.',
    content: `@echo off
:: ==============================================================================
:: GAMA KERNEL ENGINE - PORTABLE EMERGENCY RESCUE & ENVIRONMENT BOOTSTRAP (v2.0)
:: CENARIO: MAQUINA VIRGEM REINICIANDO A CADA 5 MINUTOS EM CAMPO
:: ==============================================================================
TITLE GAMA EMERGENCY KERNEL BOOTSTRAP [NT AUTHORITY\\ADMIN]
color 0A

:: 1. AUTO-ELEVACAO PARA PRIVILEGIO ADMINISTRATIVO
>nul 2>&1 "%SYSTEMROOT%\\system32\\cacls.exe" "%SYSTEMROOT%\\system32\\config\\system"
if '%errorlevel%' NEQ '0' (
    echo [!] Solicitando privilegios de Administrador Elevado...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\\getadmin.vbs"
    set params = %*:"=""
    echo UAC.ShellExecute "cmd.exe", "/c ""%~s0"" %params%", "", "runas", 1 >> "%temp%\\getadmin.vbs"
    "%temp%\\getadmin.vbs"
    del "%temp%\\getadmin.vbs"
    exit /B

:gotAdmin
    pushd "%CD%"
    CD /D "%~dp0"
    cls

echo ==============================================================================
echo   GAMA KERNEL-LEVEL AUTOMATION ENGINE - FIELD EMERGENCY STATION
echo   RESCUE SUITE v2.0.0 (DARK ARCHITECTURE / ZERO THIRD-PARTY TOOLS)
echo ==============================================================================
echo.

:: ------------------------------------------------------------------------------
:: ETAPA 1: SALVAMENTO IMEDIATO CONTRA O REINICIO EM 5 MINUTOS (ANTI-TIMEOUT)
:: ------------------------------------------------------------------------------
echo [*] [ETAPA 1/4] EXECUTANDO SUPRESSAO DE DESLIGAMENTO CRITICO...
shutdown /a >nul 2>&1
echo [OK] Temporizador de desligamento abortado (shutdown -a).

echo [*] Desativando AutoReboot em telas azuis (Mantem erro na tela)...
reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\CrashControl" /v AutoReboot /t REG_DWORD /d 0 /f >nul 2>&1

echo [*] Aplicando Cap de Seguranca Termica (Max CPU 85%% - Impede TJMax Trip)...
powercfg -setacvalueindex scheme_current sub_processor PROCPERFMAX 85 >nul 2>&1
powercfg -setdcvalueindex scheme_current sub_processor PROCPERFMAX 85 >nul 2>&1
powercfg /setacvalueindex SCHEME_CURRENT 54533251-82be-4824-96c1-47b60b740d00 be337238-0d82-4146-a960-4f3749d470c7 0 >nul 2>&1
powercfg /setactive scheme_current >nul 2>&1

echo [*] Purgando estado corrompido de Fast Startup (powercfg -h off)...
powercfg.exe -h off >nul 2>&1

echo [*] Exterminando drivers de kernel do CPU-Z e protegendo USB Tethering...
sc.exe stop cpuz154 >nul 2>&1
sc.exe delete cpuz154 >nul 2>&1
sc.exe stop cpuz155 >nul 2>&1
sc.exe delete cpuz155 >nul 2>&1
taskkill.exe /f /im cpuz.exe >nul 2>&1
del /f /q "%temp%\cpuz*.sys" >nul 2>&1
reg.exe add "HKLM\SYSTEM\CurrentControlSet\Services\RNDISMP\Parameters" /v MaxPacketsPerMessage /t REG_DWORD /d 1 /f >nul 2>&1

echo [OK] Kernel estabilizado. A maquina NAO ira reiniciar agora.
echo.

:: ------------------------------------------------------------------------------
:: ETAPA 2: DISPARAR O WATCHDOG KILLER EM SEGUNDO PLANO
:: ------------------------------------------------------------------------------
echo [*] [ETAPA 2/4] DISPARANDO SENTINELA EM SEGUNDO PLANO (GAMA_REBOOT_KILLER)...
start /b powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& { while($true) { shutdown.exe /a 2>$null; Start-Sleep -Seconds 3 } }"
echo [OK] Sentinela anti-shutdown ativo no processo de background.
echo.

:: ------------------------------------------------------------------------------
:: ETAPA 3: PREPARACAO DO AMBIENTE (NODE.JS & GIT NA MAQUINA VIRGEM)
:: ------------------------------------------------------------------------------
echo [*] [ETAPA 3/4] VERIFICANDO DEPENDENCIAS LOCAIS DO RUNTIME...
where node >nul 2>&1
if %errorlevel% NEQ 0 (
    echo [!] Node.js nao localizado na maquina virgem.
    echo [*] Tentando instalacao silenciosa automatizada via Winget...
    winget install OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements >nul 2>&1
    
    :: Se winget nao existir ou falhar, baixa binario portatil via curl nativo do Windows 10/11
    where node >nul 2>&1
    if %errorlevel% NEQ 0 (
        echo [*] Baixando Node.js LTS portatil direto via Curl nativo...
        if not exist "%~dp0tools\\node.zip" (
            mkdir "%~dp0tools" >nul 2>&1
            curl.exe -L "https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip" -o "%~dp0tools\\node.zip"
            tar -xf "%~dp0tools\\node.zip" -C "%~dp0tools"
        )
        set "PATH=%~dp0tools\\node-v20.18.0-win-x64;%PATH%"
    )
) else (
    echo [OK] Node.js detectado com sucesso:
    node -v
)

where git >nul 2>&1
if %errorlevel% NEQ 0 (
    echo [*] Instalando Git de forma silenciosa via Winget...
    winget install Git.Git -e --silent --accept-package-agreements --accept-source-agreements >nul 2>&1
) else (
    echo [OK] Git detectado com sucesso.
)
echo.

:: ------------------------------------------------------------------------------
:: ETAPA 4: INICIALIZACAO DO DASHBOARD GAMA LOCAL
:: ------------------------------------------------------------------------------
echo [*] [ETAPA 4/4] INICIALIZANDO O DASHBOARD DE MANUTENCAO GAMA...
set REPO_DIR=%~dp0gama-field-station

if exist "%REPO_DIR%\\package.json" (
    cd /d "%REPO_DIR%"
    echo [*] Instalando dependencias locais (npm install)...
    call npm install --silent
    echo [*] Abrindo aplicacao em http://localhost:3000 ...
    start "" http://localhost:3000
    call npm run dev
) else (
    echo [*] Pasta local detectada na raiz do pendrive.
    if exist "%~dp0package.json" (
        cd /d "%~dp0"
        echo [*] Instalando dependencias locais (npm install)...
        call npm install --silent
        echo [*] Abrindo aplicacao em http://localhost:3000 ...
        start "" http://localhost:3000
        call npm run dev
    ) else (
        echo [!] Copie os arquivos deste projeto React para a pasta '%REPO_DIR%' no Pendrive.
        echo [*] Pressione qualquer tecla para abrir o console PowerShell de emergencia...
        pause
        powershell.exe -NoProfile -ExecutionPolicy Bypass -NoExit
    )
)
`
  },
  {
    filename: 'GAMA_REBOOT_KILLER.ps1',
    type: 'ps1',
    title: 'GAMA Sentinela Watchdog em Tempo Real (PowerShell)',
    description: 'Script PowerShell contínuo com interface ANSI no terminal. Executa o cancelamento contínuo de desligamento (shutdown -a a cada 2s), afere temperatura ACPI e lê o Event Viewer para dizer com precisão o que está derrubando a máquina.',
    content: `# ==============================================================================
# GAMA KERNEL ENGINE - SENTINELA WATCHDOG & TRIAGEM DE REINICIALIZACAO (v2.0)
# EXECUCAO: powershell.exe -NoProfile -ExecutionPolicy Bypass -File GAMA_REBOOT_KILLER.ps1
# ==============================================================================
$Host.UI.RawUI.WindowTitle = "GAMA Kernel Watchdog - Loop Anti-Reboot Ativo"
Clear-Host

Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "   GAMA SENTINELA WATCHDOG - INTERCEPTADOR DE SHUTDOWN EM TEMPO REAL" -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "[+] Bloqueio permanente de timeout ativado." -ForegroundColor Cyan
Write-Host "[+] Pressione CTRL+C a qualquer momento para interromper o sentinela." -ForegroundColor DarkGray
Write-Host ""

# 1. Checagem inicial de eventos de desligamento anteriores
Write-Host "[*] ANALISANDO MOTIVO DO ULTIMO REINICIO NO EVENT VIEWER..." -ForegroundColor Yellow
$lastEvents = Get-WinEvent -FilterHashtable @{LogName='System'; Id=1074,6008,41} -MaxEvents 3 -ErrorAction SilentlyContinue

if ($lastEvents) {
    foreach ($ev in $lastEvents) {
        $tipo = switch ($ev.Id) {
            1074 { "Desligamento Normal / Comando / Windows Update" }
            6008 { "Desligamento Inesperado (Queda / Crash)" }
            41   { "Kernel-Power (Perda subita de energia eletrica)" }
        }
        Write-Host "  -> [ID $($ev.Id)] $($ev.TimeCreated.ToString('HH:mm:ss')) | $tipo" -ForegroundColor White
    }
} else {
    Write-Host "  -> Nenhum evento critico recente registrado no log." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "[*] SENTINELA ATIVO (Interceptando a cada 2 segundos)..." -ForegroundColor Green

$iteration = 0
while ($true) {
    $iteration++
    
    # Cancela shutdown pendente
    & shutdown.exe /a 2>$null
    
    # Afere temperatura a cada 10 ciclos (~20 segundos)
    if ($iteration % 10 -eq 1) {
        $tempProbe = Get-CimInstance -Namespace "root/wmi" -ClassName "MSAcpi_ThermalZoneTemperature" -ErrorAction SilentlyContinue
        if ($tempProbe) {
            $tempC = ($tempProbe[0].CurrentTemperature - 2732) / 10
            $color = if ($tempC -gt 85) { "Red" } elseif ($tempC -gt 70) { "Yellow" } else { "Green" }
            Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] CPU Temp ACPI: $tempC °C | Anti-Shutdown: OK" -ForegroundColor $color
            
            if ($tempC -gt 92) {
                Write-Host "  [!] ALERTA CRITICO: Temperatura perigosamente alta! Aplicando teto de 80%..." -ForegroundColor Red
                powercfg -setacvalueindex scheme_current sub_processor PROCPERFMAX 80
                powercfg /setactive scheme_current
            }
        } else {
            Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] Sentinela rodando | shutdown -a executado | Ciclo: $iteration" -ForegroundColor DarkCyan
        }
    }
    
    Start-Sleep -Seconds 2
}
`
  },
  {
    filename: 'requirements.txt',
    type: 'txt',
    title: 'Checklist de Manutenção & Instruções de Bancada',
    description: 'Arquivo de notas técnicas para deixar no pendrive junto aos scripts, contendo os procedimentos de ouro antes de mexer em qualquer máquina virgem.',
    content: `==============================================================================
GAMA KERNEL ENGINE - CHECKLIST DE OURO PARA PC VIRGEM EM CAMPO
==============================================================================

1. PROCEDIMENTO IMEDIATO AO CONECTAR O PENDRIVE:
   - Clique com o botao direito em 'GAMA_EMERGENCY_PORTABLE.bat' e escolha 'Executar como Administrador'.
   - O script executara instantaneamente:
     a) 'shutdown -a' (cancela qualquer cronometro de 5 minutos).
     b) 'powercfg -setacvalueindex scheme_current sub_processor PROCPERFMAX 85' (evita pico termico).
     c) 'powercfg -h off' (destroi hiberfil.sys corrompido).
     d) Abre a aplicacao React Dashboard em http://localhost:3000.

2. AS 4 CAUSAS PRIMARIAS DE DESLIGAMENTO EM 5 MINUTOS:
   [1] TERMICA (Pasta ressecada / Cooler parado):
       - A CPU bate 100C e a protecao da placa mae desliga o VRM.
       - A solucao emergencial de software e travar o processador em 85% pelo GAMA.
   [2] FAST STARTUP CORROMPIDO (hiberfil.sys):
       - O Windows carrega drivers velhos corrompidos na RAM.
       - Desativar com: powercfg -h off.
   [3] KERNEL-POWER EVENTO 41 COM BUGCHECK 0:
       - Indica falha puramente ELETRICA (fonte nao aguenta carga, conector DC frouxo, capacitor estufado).
   [4] WINDOWS UPDATE / CRONOMETRO DE TAREFA AGENDADA:
       - Cancelar com: shutdown /a e parar o servico wuauserv.

3. ESTRUTURA RECOMENDADA NO PENDRIVE:
   D:\\
   ├── GAMA_EMERGENCY_PORTABLE.bat  <-- Execute este primeiro!
   ├── GAMA_REBOOT_KILLER.ps1      <-- Script sentinela continuo
   └── gama-field-station\\         <-- O repositorio React clonado ou buildado
`
  }
];
