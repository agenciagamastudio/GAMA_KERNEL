import { DiagnosticItem } from '../types/gama';

export const FIVE_MINUTE_REBOOT_TRIAGE: DiagnosticItem[] = [
  {
    id: 'triage-thermal-trip',
    title: 'Disparo de Proteção Térmica da CPU (TJMax Trip / Pasta Seca / Fan Travado)',
    suspectCause: 'Superaquecimento do processador (>95°C a 105°C). Placa-mãe aciona desligamento de emergência via PROCHOT# para salvar o silício.',
    probability: 'Crítica (80%+)',
    timeframe: 'Ocorre entre 3 e 5 minutos após o boot com a elevação gradual da temperatura ambiente do cooler.',
    description: 'Diagnostica temperatura da ACPI, eventos de throttling severo (ID 37) e aplica contenção de emergência travando o clock da CPU em 85% para estabilizar sem abrir o PC.',
    diagnosticCommand: `Get-CimInstance -Namespace "root/wmi" -ClassName "MSAcpi_ThermalZoneTemperature" -ErrorAction SilentlyContinue | Select-Object InstanceName, @{N="Temp_Celsius";E={($_.CurrentTemperature - 2732)/10}}
Get-WinEvent -FilterHashtable @{LogName='System'; ProviderName='Microsoft-Windows-Kernel-Processor-Power'; Id=37} -MaxEvents 5 -ErrorAction SilentlyContinue | Format-Table TimeCreated, Message`,
    emergencyFixCommand: `powercfg -setacvalueindex scheme_current sub_processor PROCPERFMAX 85
powercfg -setdcvalueindex scheme_current sub_processor PROCPERFMAX 85
powercfg /setacvalueindex SCHEME_CURRENT 54533251-82be-4824-96c1-47b60b740d00 be337238-0d82-4146-a960-4f3749d470c7 0
powercfg /setactive scheme_current`,
    rollbackCommand: `powercfg -setacvalueindex scheme_current sub_processor PROCPERFMAX 100
powercfg -setdcvalueindex scheme_current sub_processor PROCPERFMAX 100
powercfg /setactive scheme_current`,
    status: 'idle',
    simulatedOutput: `[ACPI PROBE]
InstanceName: ACPI\\ThermalZone\\TZ00_0
Temp_Celsius: 98.4 °C  <-- ALERTA CRITICO: PROXIMO DO LIMITE TJMAX!

[KERNEL-PROCESSOR-POWER ID 37 DETECTED]
TimeCreated: 23/10/2026 14:32:10
Message: A velocidade do processador 0 no grupo 0 esta sendo limitada pelo firmware do sistema.`,
    fixOutput: `[+] Limite do processador travado em 85% (Turbo Boost neutralizado).
[+] Queda termica imediata estimada: -18°C a -25°C.
[SUCCESS] Maquina estabilizada contra desligamento por TJMax.`
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
    status: 'idle',
    simulatedOutput: `[REGISTRY CHECK]
AutoReboot: 1 (ATIVO - Reinicia a maquina sem exibir o erro!)
CrashDumpEnabled: 7

[HISTORICO DE CRASH]
Ultimo BugcheckCode: 0x0000003b (SYSTEM_SERVICE_EXCEPTION)`,
    fixOutput: `[+] AutoReboot setado para 0.
[+] Salvo dump em C:\\Windows\\Minidump.
[SUCCESS] Se houver falha, o Windows congelara na tela azul com o nome do arquivo .sys causador.`
  },
  {
    id: 'triage-scheduled-shutdown',
    title: 'Loop de Tarefa Agendada / Windows Update / Timer Forçado de Desligamento',
    suspectCause: 'Windows Update Orchestrator, falha de ativação (grace period expirado que desliga a cada 2h ou 5min) ou script de encerramento em fila.',
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
    status: 'idle',
    simulatedOutput: `[EVENT LOG 1074 - RECENT REBOOT INITIATOR]
TimeCreated: 23/10/2026 14:28:44
Message: O processo C:\\Windows\\system32\\shutdown.exe iniciou o desligamento do computador em nome do usuario NT AUTHORITY\\SYSTEM pela razao: Manutencao de Sistema ou Atualizacao pendente.`,
    fixOutput: `[+] shutdown -a executado com sucesso (qualquer temporizador ativo foi cancelado).
[+] Servico wuauserv desativado temporariamente.
[+] Tarefa de Reboot do UpdateOrchestrator bloqueada.
[SUCCESS] Temporizador de desligamento abortado.`
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
    status: 'idle',
    simulatedOutput: `[FAST STARTUP STATUS]
HiberbootEnabled: 1 (Ativo)
hiberfil.sys presente: 12.8 GB em uso no drive C:`,
    fixOutput: `[+] powercfg -h off executado.
[+] hiberfil.sys purgado com sucesso.
[SUCCESS] O Windows agora inicializara de forma limpa, eliminando ciclos de memoria corrompida.`
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
    status: 'idle',
    simulatedOutput: `[KERNEL-POWER ID 41 LOG ANALYSIS]
TimeCreated: 23/10/2026 14:15:02
BugcheckCode: 0 (INDICA QUEDA DE ENERGIA INSTANTANEA / HARDWARE OU FONTE)
Diagnostico GAMA: A placa perdeu alimentacao subitamente. Reduzir consumo de pico imediatamente.`,
    fixOutput: `[+] Modo de energia setado para equilibrado com teto de 80% de TDP.
[+] Demanda de corrente do circuito VRM/Fonte reduzida em ~30%.
[SUCCESS] Carga eletrica estabilizada.`
  }
];
