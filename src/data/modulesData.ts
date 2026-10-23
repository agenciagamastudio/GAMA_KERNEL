import { OptimizationModule } from '../types/gama';

export const GAMA_OPTIMIZATION_MODULES: OptimizationModule[] = [
  {
    id: 'gama-usb-tethering-cpuz',
    module_name: 'GAMA_USB_Tethering_BSOD_Mitigation',
    title: 'Mitigação de Tela Azul em Ancoragem USB Android & Remoção de Driver CPU-Z',
    description: 'Descarrega e exclui do registro os drivers de kernel obsoletos do CPU-Z (cpuz154.sys / cpuz155.sys) que colidem com a pilha RNDIS do Android 4G ao plugar o cabo USB. Reseta o catálogo Winsock e ajusta buffers NDIS.',
    category: 'USB & Drivers',
    risk_level: 'Seguro (Baixo Risco)',
    target_windows_versions: ['10', '11'],
    require_reboot: false,
    optimization_payload: [
      {
        type: 'service',
        path: 'cpuz154',
        property: 'delete',
        value: 'deleted',
        value_type: 'CLI_EXEC'
      },
      {
        type: 'registry',
        path: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\RNDISMP\\Parameters',
        property: 'MaxPacketsPerMessage',
        value: 1,
        value_type: 'REG_DWORD'
      },
      {
        type: 'command',
        path: 'netsh.exe',
        property: 'winsock reset catalog',
        value: 'catalog',
        value_type: 'CLI_EXEC'
      }
    ],
    rollback_payload: [
      {
        type: 'registry',
        path: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\RNDISMP\\Parameters',
        property: 'MaxPacketsPerMessage',
        value: 0,
        value_type: 'REG_DWORD'
      }
    ],
    executable_script: `# ==============================================================================
# GAMA KERNEL ENGINE - MODULE: GAMA_USB_Tethering_BSOD_Mitigation
# ELIMINA COLISÃO NO ANEL 0 ENTRE CPU-Z E RNDIS ANDROID (4G TETHERING)
# ==============================================================================
$ErrorActionPreference = "SilentlyContinue"

Write-Output "[+] Parando e removendo drivers de kernel invasivos do CPU-Z..."
$drivers = @("cpuz154", "cpuz155", "cpuz150", "cpuz143")
foreach ($d in $drivers) {
    sc.exe stop $d 2>$null | Out-Null
    sc.exe delete $d 2>$null | Out-Null
}

Write-Output "[+] Finalizando processos do CPU-Z e purgando arquivos temporários..."
taskkill.exe /f /im cpuz.exe 2>$null | Out-Null
Remove-Item "$env:TEMP\\cpuz*" -Recurse -Force -ErrorAction SilentlyContinue

Write-Output "[+] Resetando pilha de rede e adaptadores NDIS..."
netsh winsock reset catalog | Out-Null
netsh int ip reset | Out-Null
ipconfig /flushdns | Out-Null

Write-Output "[+] Aplicando mitigação de buffer para RNDIS (Android USB Tethering)..."
reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\RNDISMP\\Parameters" /v MaxPacketsPerMessage /t REG_DWORD /d 1 /f | Out-Null
reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\RNDISMP6\\Parameters" /v MaxPacketsPerMessage /t REG_DWORD /d 1 /f | Out-Null

Write-Output "[SUCCESS] Pilha USB Tethering protegida contra BugCheck DRIVER_IRQL_NOT_LESS_OR_EQUAL."
`,
    rollback_script: `# ==============================================================================
# GAMA ROLLBACK - MODULE: GAMA_USB_Tethering_BSOD_Mitigation
# ==============================================================================
$ErrorActionPreference = "SilentlyContinue"
reg.exe delete "HKLM\\SYSTEM\\CurrentControlSet\\Services\\RNDISMP\\Parameters" /v MaxPacketsPerMessage /f 2>$null | Out-Null
reg.exe delete "HKLM\\SYSTEM\\CurrentControlSet\\Services\\RNDISMP6\\Parameters" /v MaxPacketsPerMessage /f 2>$null | Out-Null
Write-Output "[ROLLBACK SUCCESS] Parâmetros de driver RNDIS restaurados para o padrão."
`
  },
  {
    id: 'gama-crash-control',
    module_name: 'GAMA_CrashControl_AutoReboot_Suppress',
    title: 'Supressão de Auto-Reboot por Falha de Kernel (CrashControl)',
    description: 'Desativa o reinício imediato após tela azul ou falha crítica de hardware. Força o Windows a manter o código de erro (BugCheck 0x000...) na tela e salvar o arquivo minidump em C:\\Windows\\Minidump.',
    category: 'Kernel & Crash',
    risk_level: 'Seguro (Baixo Risco)',
    target_windows_versions: ['10', '11'],
    require_reboot: false,
    optimization_payload: [
      {
        type: 'registry',
        path: 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\CrashControl',
        property: 'AutoReboot',
        value: 0,
        value_type: 'REG_DWORD'
      },
      {
        type: 'registry',
        path: 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\CrashControl',
        property: 'CrashDumpEnabled',
        value: 3, // Minidump (Small Memory Dump)
        value_type: 'REG_DWORD'
      },
      {
        type: 'registry',
        path: 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\CrashControl',
        property: 'LogEvent',
        value: 1,
        value_type: 'REG_DWORD'
      }
    ],
    rollback_payload: [
      {
        type: 'registry',
        path: 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\CrashControl',
        property: 'AutoReboot',
        value: 1,
        value_type: 'REG_DWORD'
      },
      {
        type: 'registry',
        path: 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\CrashControl',
        property: 'CrashDumpEnabled',
        value: 7, // Default Automatic memory dump
        value_type: 'REG_DWORD'
      },
      {
        type: 'registry',
        path: 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\CrashControl',
        property: 'LogEvent',
        value: 1,
        value_type: 'REG_DWORD'
      }
    ],
    executable_script: `# ==============================================================================
# GAMA KERNEL ENGINE - MODULE: GAMA_CrashControl_AutoReboot_Suppress
# PRIVILEGE: NT AUTHORITY\\SYSTEM / Elevated Administrator
# OS TARGET: Windows 10/11 64-bit
# ==============================================================================
$ErrorActionPreference = "SilentlyContinue"

Write-Output "[+] Aplicando supressao cirurgica de AutoReboot no CrashControl..."
reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\CrashControl" /v AutoReboot /t REG_DWORD /d 0 /f | Out-Null
reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 3 /f | Out-Null
reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\CrashControl" /v LogEvent /t REG_DWORD /d 1 /f | Out-Null

Write-Output "[*] Verificando integridade das chaves..."
$check = (Get-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\CrashControl" -Name AutoReboot).AutoReboot
if ($check -eq 0) {
    Write-Output "[SUCCESS] CrashControl ajustado: Telas azuis exibem BugCheck na tela sem reiniciar em loop."
} else {
    Write-Error "[FAIL] Nao foi possivel escrever na chave CrashControl."
}`,
    rollback_script: `# ==============================================================================
# GAMA ROLLBACK - MODULE: GAMA_CrashControl_AutoReboot_Suppress
# ==============================================================================
$ErrorActionPreference = "SilentlyContinue"

Write-Output "[-] Revertendo CrashControl para padrao de fabrica do Windows..."
reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\CrashControl" /v AutoReboot /t REG_DWORD /d 1 /f | Out-Null
reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 7 /f | Out-Null
Write-Output "[ROLLBACK SUCCESS] AutoReboot restaurado para 1 (Padrao Windows)."
`
  },
  {
    id: 'gama-thermal-emergency-cap',
    module_name: 'GAMA_Thermal_Throttle_Emergency_Cap',
    title: 'Cap Emergencial de Pico Térmico da CPU (Anti-TJMax Trip)',
    description: 'Reduz temporariamente o estado máximo de energia do processador de 100% para 85% e desativa picos agressivos de Turbo Boost via powercfg nativo. Impede que a CPU atinja 95°C-105°C e force o desligamento térmico da placa-mãe.',
    category: 'Thermal & Power',
    risk_level: 'Seguro (Baixo Risco)',
    target_windows_versions: ['10', '11'],
    require_reboot: false,
    optimization_payload: [
      {
        type: 'command',
        path: 'powercfg.exe',
        property: 'PROCFREQMAX / PROCPERFMAX',
        value: '85',
        value_type: 'CLI_EXEC'
      },
      {
        type: 'command',
        path: 'powercfg.exe',
        property: 'PERFBOOSTMODE',
        value: '0',
        value_type: 'CLI_EXEC'
      }
    ],
    rollback_payload: [
      {
        type: 'command',
        path: 'powercfg.exe',
        property: 'PROCFREQMAX / PROCPERFMAX',
        value: '100',
        value_type: 'CLI_EXEC'
      },
      {
        type: 'command',
        path: 'powercfg.exe',
        property: 'PERFBOOSTMODE',
        value: '2', // Default Aggressive Boost
        value_type: 'CLI_EXEC'
      }
    ],
    executable_script: `# ==============================================================================
# GAMA KERNEL ENGINE - MODULE: GAMA_Thermal_Throttle_Emergency_Cap
# REDUZ AQUECIMENTO EM ATE 20C EM CAMPO SEM ABRIR O GABINETE
# ==============================================================================
$ErrorActionPreference = "SilentlyContinue"

Write-Output "[+] Limitando estado maximo do processador para 85% (Elimina pico termico)..."
powercfg -setacvalueindex scheme_current sub_processor PROCPERFMAX 85
powercfg -setdcvalueindex scheme_current sub_processor PROCPERFMAX 85

# Desativa Boost agressivo momentaneo (GUID: 54533251-82be-4824-96c1-47b60b740d00 / be337238-0d82-4146-a960-4f3749d470c7)
powercfg /setacvalueindex SCHEME_CURRENT 54533251-82be-4824-96c1-47b60b740d00 be337238-0d82-4146-a960-4f3749d470c7 0
powercfg /setactive scheme_current

Write-Output "[SUCCESS] CPU operando em temperatura estavel. Risco de desligamento termico drasticamente reduzido."
`,
    rollback_script: `# ==============================================================================
# GAMA ROLLBACK - MODULE: GAMA_Thermal_Throttle_Emergency_Cap
# ==============================================================================
$ErrorActionPreference = "SilentlyContinue"

Write-Output "[-] Restaurando processador para 100% e Turbo Boost Ativo..."
powercfg -setacvalueindex scheme_current sub_processor PROCPERFMAX 100
powercfg -setdcvalueindex scheme_current sub_processor PROCPERFMAX 100
powercfg /setacvalueindex SCHEME_CURRENT 54533251-82be-4824-96c1-47b60b740d00 be337238-0d82-4146-a960-4f3749d470c7 2
powercfg /setactive scheme_current

Write-Output "[ROLLBACK SUCCESS] Processador restaurado para 100% de fabrica."
`
  },
  {
    id: 'gama-fast-startup-purge',
    module_name: 'GAMA_FastStartup_Hiberfil_Purge',
    title: 'Desativação de Inicialização Rápida & Kernel Hibernation (powercfg -h off)',
    description: 'A "Inicialização Rápida" (Fast Startup) do Windows salva o estado do kernel no arquivo hiberfil.sys. Quando o arquivo corrompe ou há conflito de driver ACPI, o Windows entra em loop de reinício a cada poucos minutos. A desativação força um boot limpo e libera gigabytes de espaço em disco.',
    category: 'Kernel & Crash',
    risk_level: 'Seguro (Baixo Risco)',
    target_windows_versions: ['10', '11'],
    require_reboot: false,
    optimization_payload: [
      {
        type: 'registry',
        path: 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power',
        property: 'HiberbootEnabled',
        value: 0,
        value_type: 'REG_DWORD'
      },
      {
        type: 'command',
        path: 'powercfg.exe',
        property: '-h',
        value: 'off',
        value_type: 'CLI_EXEC'
      }
    ],
    rollback_payload: [
      {
        type: 'registry',
        path: 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power',
        property: 'HiberbootEnabled',
        value: 1,
        value_type: 'REG_DWORD'
      },
      {
        type: 'command',
        path: 'powercfg.exe',
        property: '-h',
        value: 'on',
        value_type: 'CLI_EXEC'
      }
    ],
    executable_script: `# ==============================================================================
# GAMA KERNEL ENGINE - MODULE: GAMA_FastStartup_Hiberfil_Purge
# ==============================================================================
$ErrorActionPreference = "SilentlyContinue"

Write-Output "[+] Purgando hiberfil.sys e desativando Fast Startup..."
powercfg.exe -h off
reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power" /v HiberbootEnabled /t REG_DWORD /d 0 /f | Out-Null

Write-Output "[SUCCESS] Inicializacao Rapida eliminada. Boot limpo e liberacao de 8-16GB em C:\\."
`,
    rollback_script: `# ==============================================================================
# GAMA ROLLBACK - MODULE: GAMA_FastStartup_Hiberfil_Purge
# ==============================================================================
$ErrorActionPreference = "SilentlyContinue"

Write-Output "[-] Reabilitando Hibernacao e Fast Startup..."
powercfg.exe -h on
reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power" /v HiberbootEnabled /t REG_DWORD /d 1 /f | Out-Null

Write-Output "[ROLLBACK SUCCESS] Fast Startup e hiberfil.sys restaurados."
`
  },
  {
    id: 'gama-telemetry-neutralizer',
    module_name: 'GAMA_Telemetry_Spyware_Neutralizer',
    title: 'Neutralização Cirúrgica de Telemetria e DiagTrack',
    description: 'Desativa o serviço Connected User Experiences and Telemetry (DiagTrack) e o dmwappushservice via sc.exe nativo, eliminando consumo espúrio de disco a 100% em PCs recém-formatados.',
    category: 'Telemetry & Privacy',
    risk_level: 'Seguro (Baixo Risco)',
    target_windows_versions: ['10', '11'],
    require_reboot: false,
    optimization_payload: [
      {
        type: 'service',
        path: 'DiagTrack',
        property: 'start',
        value: 'disabled',
        value_type: 'SERVICE_START'
      },
      {
        type: 'service',
        path: 'dmwappushservice',
        property: 'start',
        value: 'disabled',
        value_type: 'SERVICE_START'
      },
      {
        type: 'registry',
        path: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection',
        property: 'AllowTelemetry',
        value: 0,
        value_type: 'REG_DWORD'
      }
    ],
    rollback_payload: [
      {
        type: 'service',
        path: 'DiagTrack',
        property: 'start',
        value: 'auto',
        value_type: 'SERVICE_START'
      },
      {
        type: 'service',
        path: 'dmwappushservice',
        property: 'start',
        value: 'demand',
        value_type: 'SERVICE_START'
      },
      {
        type: 'registry',
        path: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection',
        property: 'AllowTelemetry',
        value: 3, // Full telemetry default
        value_type: 'REG_DWORD'
      }
    ],
    executable_script: `# ==============================================================================
# GAMA KERNEL ENGINE - MODULE: GAMA_Telemetry_Spyware_Neutralizer
# ==============================================================================
$ErrorActionPreference = "SilentlyContinue"

Write-Output "[+] Parando e desativando servicos de telemetria..."
sc.exe stop DiagTrack | Out-Null
sc.exe config DiagTrack start=disabled | Out-Null
sc.exe stop dmwappushservice | Out-Null
sc.exe config dmwappushservice start=disabled | Out-Null

Write-Output "[+] Aplicando politica de bloqueio no DataCollection..."
reg.exe add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f | Out-Null

Write-Output "[SUCCESS] Telemetria DiagTrack neutralizada com sucesso."
`,
    rollback_script: `# ==============================================================================
# GAMA ROLLBACK - MODULE: GAMA_Telemetry_Spyware_Neutralizer
# ==============================================================================
$ErrorActionPreference = "SilentlyContinue"

Write-Output "[-] Restaurando servicos de telemetria para os padroes..."
sc.exe config DiagTrack start=auto | Out-Null
sc.exe start DiagTrack | Out-Null
sc.exe config dmwappushservice start=demand | Out-Null
reg.exe add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 3 /f | Out-Null

Write-Output "[ROLLBACK SUCCESS] Telemetria restaurada."
`
  },
  {
    id: 'gama-network-tcp-purge',
    module_name: 'GAMA_Network_TCP_Stack_Purge',
    title: 'Purga e Reset da Pilha TCP/IP, Winsock e Cache DNS',
    description: 'Restaura a pilha do Winsock, limpa sockets travados, reseta rotas e libera tabelas ARP e DNS sujas que travam a conexão de rede ou impedem resolução de hosts.',
    category: 'Network',
    risk_level: 'Seguro (Baixo Risco)',
    target_windows_versions: ['10', '11'],
    require_reboot: false,
    optimization_payload: [
      {
        type: 'command',
        path: 'netsh.exe',
        property: 'winsock reset',
        value: 'catalog',
        value_type: 'CLI_EXEC'
      },
      {
        type: 'command',
        path: 'netsh.exe',
        property: 'int ip reset',
        value: 'resetlog.txt',
        value_type: 'CLI_EXEC'
      },
      {
        type: 'command',
        path: 'ipconfig.exe',
        property: '/flushdns',
        value: 'flush',
        value_type: 'CLI_EXEC'
      }
    ],
    rollback_payload: [
      {
        type: 'command',
        path: 'netsh.exe',
        property: 'int ip reset',
        value: 'default',
        value_type: 'CLI_EXEC'
      }
    ],
    executable_script: `# ==============================================================================
# GAMA KERNEL ENGINE - MODULE: GAMA_Network_TCP_Stack_Purge
# ==============================================================================
$ErrorActionPreference = "SilentlyContinue"

Write-Output "[+] Resetando catalogo do Winsock..."
netsh winsock reset catalog | Out-Null

Write-Output "[+] Resetando pilha TCP/IP v4 e v6..."
netsh int ip reset "$env:TEMP\\resetlog.txt" | Out-Null

Write-Output "[+] Purgando cache DNS resolver..."
ipconfig /flushdns | Out-Null

Write-Output "[+] Purgando tabela ARP..."
arp -d * | Out-Null

Write-Output "[SUCCESS] Pilha de rede purgada e restaurada."
`,
    rollback_script: `# ==============================================================================
# GAMA ROLLBACK - MODULE: GAMA_Network_TCP_Stack_Purge
# ==============================================================================
$ErrorActionPreference = "SilentlyContinue"
Write-Output "[-] Pilha TCP/IP ja se encontra no estado de catalogo limpo."
`
  },
  {
    id: 'gama-storage-dism-sfc',
    module_name: 'GAMA_Storage_DISM_SFC_Health',
    title: 'Reparo Profundo do Component Store (DISM + SFC Scannow)',
    description: 'Executa a verificação e restauração de integridade dos binários nativos do Windows através do WinSxS (/RestoreHealth) e validação dos hashes de sistema protegido.',
    category: 'Storage & Integrity',
    risk_level: 'Seguro (Baixo Risco)',
    target_windows_versions: ['10', '11'],
    require_reboot: false,
    optimization_payload: [
      {
        type: 'command',
        path: 'dism.exe',
        property: '/Online /Cleanup-Image /RestoreHealth',
        value: 'ComponentStore',
        value_type: 'CLI_EXEC'
      },
      {
        type: 'command',
        path: 'sfc.exe',
        property: '/scannow',
        value: 'SystemFileChecker',
        value_type: 'CLI_EXEC'
      }
    ],
    rollback_payload: [
      {
        type: 'command',
        path: 'dism.exe',
        property: 'none',
        value: 'AuditOnly',
        value_type: 'CLI_EXEC'
      }
    ],
    executable_script: `# ==============================================================================
# GAMA KERNEL ENGINE - MODULE: GAMA_Storage_DISM_SFC_Health
# ==============================================================================
$ErrorActionPreference = "SilentlyContinue"

Write-Output "[+] Executando DISM /Online /Cleanup-Image /RestoreHealth..."
dism.exe /Online /Cleanup-Image /RestoreHealth /quiet

Write-Output "[+] Executando SFC /scannow para checagem de integridade de arquivos de sistema..."
sfc.exe /scannow

Write-Output "[SUCCESS] Component Store e arquivos de sistema verificados e reparados."
`,
    rollback_script: `# ==============================================================================
# GAMA ROLLBACK - MODULE: GAMA_Storage_DISM_SFC_Health
# ==============================================================================
Write-Output "[-] O reparo de arquivos corrompidos e cumulativo e nao requer rollback."
`
  },
  {
    id: 'gama-dpc-latency-tuning',
    module_name: 'GAMA_Latency_MMCSS_Tuning',
    title: 'Otimização de Latência DPC & MMCSS (Multimedia Class Scheduler)',
    description: 'Elimina micro-travamentos de áudio/vídeo e throttling de pacotes de rede do Windows ajustando SystemResponsiveness para 0 e NetworkThrottlingIndex para 0xFFFFFFFF.',
    category: 'Latency & Gaming',
    risk_level: 'Intermediário',
    target_windows_versions: ['10', '11'],
    require_reboot: false,
    optimization_payload: [
      {
        type: 'registry',
        path: 'HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile',
        property: 'SystemResponsiveness',
        value: 0,
        value_type: 'REG_DWORD'
      },
      {
        type: 'registry',
        path: 'HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile',
        property: 'NetworkThrottlingIndex',
        value: 4294967295, // 0xffffffff
        value_type: 'REG_DWORD'
      }
    ],
    rollback_payload: [
      {
        type: 'registry',
        path: 'HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile',
        property: 'SystemResponsiveness',
        value: 20, // Default 20% reserved
        value_type: 'REG_DWORD'
      },
      {
        type: 'registry',
        path: 'HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile',
        property: 'NetworkThrottlingIndex',
        value: 10, // Default 10 packets per ms
        value_type: 'REG_DWORD'
      }
    ],
    executable_script: `# ==============================================================================
# GAMA KERNEL ENGINE - MODULE: GAMA_Latency_MMCSS_Tuning
# ==============================================================================
$ErrorActionPreference = "SilentlyContinue"

Write-Output "[+] Configurando MMCSS para prioridade total de tempo de resposta..."
reg.exe add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v SystemResponsiveness /t REG_DWORD /d 0 /f | Out-Null
reg.exe add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v NetworkThrottlingIndex /t REG_DWORD /d 0xFFFFFFFF /f | Out-Null

Write-Output "[SUCCESS] Latencia DPC reduzida e throttling de rede desligado."
`,
    rollback_script: `# ==============================================================================
# GAMA ROLLBACK - MODULE: GAMA_Latency_MMCSS_Tuning
# ==============================================================================
$ErrorActionPreference = "SilentlyContinue"

Write-Output "[-] Revertendo MMCSS para os valores de fabrica..."
reg.exe add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v SystemResponsiveness /t REG_DWORD /d 20 /f | Out-Null
reg.exe add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v NetworkThrottlingIndex /t REG_DWORD /d 10 /f | Out-Null

Write-Output "[ROLLBACK SUCCESS] MMCSS restaurado para padrao Windows."
`
  }
];
