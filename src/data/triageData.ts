import { DiagnosticItem } from '../types/gama';

export const FIVE_MINUTE_REBOOT_TRIAGE: DiagnosticItem[] = [
  {
    id: 'triage-usb-tethering-cpuz',
    title: 'Tela Azul ao Conectar Ancoragem USB Android (Conflito CPU-Z Driver / RNDIS)',
    suspectCause: 'Colisão no anel 0 entre o driver de kernel residual do CPU-Z (cpuz154.sys / cpuz155.sys) e o driver de ancoragem de rede USB do Android (RNDIS/NDIS). Provoca DRIVER_IRQL_NOT_LESS_OR_EQUAL imediato ao plugar o cabo.',
    probability: 'Crítica (90%+ se plugar celular)',
    timeframe: 'Instantâneo no momento em que a ancoragem USB (4G) é ativada no celular.',
    description: 'Verifica serviços do CPU-Z instalados no sistema, encerra instâncias residentes, remove o serviço do kernel e purga o cache de rede RNDIS.',
    diagnosticCommand: `Get-Service -Name "cpuz*" -ErrorAction SilentlyContinue | Format-Table Name, Status, StartType
Get-Item -Path "C:\\Windows\\Temp\\cpuz*", "$env:TEMP\\cpuz*" -ErrorAction SilentlyContinue | Select-Object FullName
Get-PnpDevice -Class "Net" | Where-Object { $_.FriendlyName -like "*RNDIS*" -or $_.FriendlyName -like "*Remote NDIS*" } | Format-Table Status, FriendlyName, InstanceId`,
    emergencyFixCommand: `sc.exe stop cpuz154 2>$null; sc.exe delete cpuz154 2>$null
sc.exe stop cpuz155 2>$null; sc.exe delete cpuz155 2>$null
sc.exe stop cpuz150 2>$null; sc.exe delete cpuz150 2>$null
taskkill.exe /f /im cpuz.exe 2>$null
Remove-Item "$env:TEMP\\cpuz*" -Recurse -Force -ErrorAction SilentlyContinue
netsh winsock reset catalog
netsh int ip reset
ipconfig /flushdns
reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\RNDISMP\\Parameters" /v MaxPacketsPerMessage /t REG_DWORD /d 1 /f
reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\RNDISMP6\\Parameters" /v MaxPacketsPerMessage /t REG_DWORD /d 1 /f`,
    rollbackCommand: `reg.exe delete "HKLM\\SYSTEM\\CurrentControlSet\\Services\\RNDISMP\\Parameters" /v MaxPacketsPerMessage /f 2>$null
reg.exe delete "HKLM\\SYSTEM\\CurrentControlSet\\Services\\RNDISMP6\\Parameters" /v MaxPacketsPerMessage /f 2>$null`,
    status: 'idle'
  },
  {
    id: 'triage-thermal-trip',
    title: 'Disparo de Proteção Térmica da CPU (TJMax Trip / Pasta Seca / Fan Travado)',
    suspectCause: 'Superaquecimento do processador (>95°C a 105°C). Placa-mãe aciona desligamento de emergência via PROCHOT# para salvar o silício.',
    probability: 'Crítica (80%+)',
    timeframe: 'Ocorre entre 3 e 5 minutos após o boot com a elevação gradual da temperatura ambiente do cooler.',
    description: 'Diagnostica temperatura da ACPI, eventos de throttling severo (ID 37) e aplica contenção travando o clock da CPU em 85% para estabilizar sem abrir o PC.',
    diagnosticCommand: `Get-CimInstance -Namespace "root/wmi" -ClassName "MSAcpi_ThermalZoneTemperature" -ErrorAction SilentlyContinue | Select-Object InstanceName, @{N="Temp_Celsius";E={($_.CurrentTemperature - 2732)/10}}
Get-WinEvent -FilterHashtable @{LogName='System'; ProviderName='Microsoft-Windows-Kernel-Processor-Power'; Id=37} -MaxEvents 5 -ErrorAction SilentlyContinue | Format-Table TimeCreated, Message`,
    emergencyFixCommand: `powercfg -setacvalueindex scheme_current sub_processor PROCPERFMAX 85
powercfg -setdcvalueindex scheme_current sub_processor PROCPERFMAX 85
powercfg /setacvalueindex SCHEME_CURRENT 54533251-82be-4824-96c1-47b60b740d00 be337238-0d82-4146-a960-4f3749d470c7 0
powercfg /setactive scheme_current`,
    rollbackCommand: `powercfg -setacvalueindex scheme_current sub_processor PROCPERFMAX 100
powercfg -setdcvalueindex scheme_current sub_processor PROCPERFMAX 100
powercfg /setactive scheme_current`,
    status: 'idle'
  },
  {
    id: 'triage-autoreboot-bsod',
    title: 'Loop de Auto-Reboot Oculto por Falha Crítica / Driver (BSOD sem Exibição)',
    suspectCause: 'O Windows está sofrendo tela azul por falha de driver ou memória, mas o recurso AutoReboot reinicia o computador instantaneamente antes que você possa ler o código.',
    probability: 'Alta (60%)',
    timeframe: 'Exatamente quando determinados serviços ou drivers de rede/vídeo terminam de carregar (3 a 5 min).',
    description: 'Força a retenção da tela azul (BugCheck) sem reiniciar e ativa a gravação do minidump de depuração.',
    diagnosticCommand: `Get-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\CrashControl" | Select-Object AutoReboot, CrashDumpEnabled, DumpFile
Get-WinEvent -FilterHashtable @{LogName='System'; ProviderName='Microsoft-Windows-WER-SystemErrorReporting'} -MaxEvents 3 -ErrorAction SilentlyContinue`,
    emergencyFixCommand: `reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\CrashControl" /v AutoReboot /t REG_DWORD /d 0 /f
reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 3 /f
wmic recoveros set autoreboot = false`,
    rollbackCommand: `reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\CrashControl" /v AutoReboot /t REG_DWORD /d 1 /f`,
    status: 'idle'
  },
  {
    id: 'triage-scheduled-shutdown',
    title: 'Loop de Tarefa Agendada / Windows Update / Timer Forçado de Desligamento',
    suspectCause: 'Windows Update Orchestrator, falha de ativação (grace period expirado que desliga a cada 5min) ou script de encerramento em fila.',
    probability: 'Alta (60%)',
    timeframe: 'Temporizador fixo de 300 segundos (5 minutos) disparado pelo serviço de atualização ou política local.',
    description: 'Executa cancelamento imediato de shutdown (shutdown -a) e desabilita tarefas agendadas de reboot forçado.',
    diagnosticCommand: `Get-WinEvent -FilterHashtable @{LogName='System'; Id=1074} -MaxEvents 5 -ErrorAction SilentlyContinue | Format-Table TimeCreated, Message
Get-ScheduledTask -TaskPath "\\Microsoft\\Windows\\UpdateOrchestrator\\" -ErrorAction SilentlyContinue | Select-Object TaskName, State`,
    emergencyFixCommand: `shutdown /a
sc.exe stop wuauserv
sc.exe config wuauserv start=disabled
schtasks /change /tn "\\Microsoft\\Windows\\UpdateOrchestrator\\Reboot" /disable`,
    rollbackCommand: `sc.exe config wuauserv start=demand
schtasks /change /tn "\\Microsoft\\Windows\\UpdateOrchestrator\\Reboot" /enable`,
    status: 'idle'
  },
  {
    id: 'triage-faststartup-hiber',
    title: 'Corrupção de Estado Hibernado do Kernel (Fast Startup / hiberfil.sys)',
    suspectCause: 'O recurso Inicialização Rápida carrega um snapshot corrompido de drivers na RAM a cada ligamento, causando desestabilização e colapso do kernel após ~5 minutos.',
    probability: 'Média (50%)',
    timeframe: 'Instabilidade cumulativa após 3 a 5 minutos com início de I/O em disco.',
    description: 'Desativa completamente a hibernação e o Fast Startup, forçando uma inicialização 100% fria e limpa da memória RAM.',
    diagnosticCommand: `powercfg /availablesleepstates
Get-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power" -Name HiberbootEnabled`,
    emergencyFixCommand: `powercfg -h off
reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power" /v HiberbootEnabled /t REG_DWORD /d 0 /f`,
    rollbackCommand: `powercfg -h on
reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power" /v HiberbootEnabled /t REG_DWORD /d 1 /f`,
    status: 'idle'
  },
  {
    id: 'triage-kernel-power-41',
    title: 'Kernel-Power Evento 41 (Queda Súbita de Tensão / Fonte / VRM da Placa)',
    suspectCause: 'O computador perde energia sem registrar nenhum evento de desligamento prévio (BugcheckCode: 0). Causa típica: trilha de 12V da fonte caindo sob carga ou capacitor estufado.',
    probability: 'Média (40%)',
    timeframe: 'Quando a CPU entra em boost de energia (3 a 5 minutos ao rodar tarefas de segundo plano).',
    description: 'Inspeciona detalhadamente o evento de Kernel-Power 41 para diferenciar falha de software (com BugcheckCode) de desligamento elétrico puro (BugcheckCode=0).',
    diagnosticCommand: `Get-WinEvent -FilterHashtable @{LogName='System'; ProviderName='Microsoft-Windows-Kernel-Power'; Id=41} -MaxEvents 3 -ErrorAction SilentlyContinue | Select-Object TimeCreated, @{N="BugcheckCode";E={$_.Properties[0].Value}}, @{N="PowerButtonTimestamp";E={$_.Properties[3].Value}}`,
    emergencyFixCommand: `powercfg /setactive 381b4222-f694-41f0-9685-ff5bb260df2e
powercfg -setacvalueindex scheme_current sub_processor PROCPERFMAX 80`,
    rollbackCommand: `powercfg -setacvalueindex scheme_current sub_processor PROCPERFMAX 100`,
    status: 'idle'
  }
];
