import { TerminalCommand } from '../types/gama';

export const GAMA_TERMINAL_MACETES: TerminalCommand[] = [
  // 1. Hardware & Térmico
  {
    id: 'cmd-wmi-thermal',
    title: 'Consultar Temperatura Real dos Sensores ACPI via WMI',
    category: 'Hardware & Térmico',
    command: `Get-CimInstance -Namespace "root/wmi" -ClassName "MSAcpi_ThermalZoneTemperature" | Select-Object InstanceName, @{N="Temp_Celsius";E={($_.CurrentTemperature - 2732)/10}}`,
    description: 'Lê diretamente da BIOS/ACPI a temperatura em Kelvin, converte para Celsius e exibe cada zona térmica da placa-mãe sem necessidade de programas de terceiros.',
    elevation: true,
    dangerLevel: 'Baixo',
    practicalTip: 'Se qualquer zona acusar acima de 90°C em repouso, o cooler está frouxo ou a pasta térmica está completamente ressecada.'
  },
  {
    id: 'cmd-battery-report',
    title: 'Gerar Relatório Profundo de Saúde da Bateria (powercfg)',
    category: 'Hardware & Térmico',
    command: `powercfg /batteryreport /output "$env:USERPROFILE\\Desktop\\Battery_Health.html" && Start-Process "$env:USERPROFILE\\Desktop\\Battery_Health.html"`,
    description: 'Gera um documento HTML completo na Área de Trabalho com histórico de capacidade máxima de fábrica vs capacidade atual, contagem de ciclos e descarregamentos bruscos.',
    elevation: true,
    dangerLevel: 'Baixo',
    practicalTip: 'Identifica células mortas que causam desligamento repentino em notebooks quando desplugados da tomada.'
  },
  {
    id: 'cmd-ram-diagnostic',
    title: 'Agendar Teste Nativo de Memória RAM (Windows Memory Diagnostic)',
    category: 'Hardware & Térmico',
    command: `mdsched.exe`,
    description: 'Abre a ferramenta nativa do Windows para reiniciar e testar minuciosamente a memória RAM antes do carregamento do sistema operacional (identifica endereços com bit flip).',
    elevation: true,
    dangerLevel: 'Baixo',
    practicalTip: 'Essencial quando o PC sofre travamentos aleatórios com telas azuis de códigos diferentes a cada vez (ex: IRQL_NOT_LESS_OR_EQUAL).'
  },
  {
    id: 'cmd-smart-disk',
    title: 'Verificar Status de Saúde S.M.A.R.T dos Discos Rígidos/SSDs',
    category: 'Hardware & Térmico',
    command: `wmic diskdrive get model,status,InterfaceType,Size`,
    description: 'Interroga o controlador dos discos para verificar se o status S.M.A.R.T retorna "OK" ou "Pred Fail" (falha iminente).',
    elevation: false,
    dangerLevel: 'Baixo',
    practicalTip: 'Se retornar "Pred Fail", o disco possui setores críticos realocados esgotados e deve ser clonado com urgência.'
  },

  // 2. Rede & TCP/IP
  {
    id: 'cmd-flush-reset-stack',
    title: 'Reset Total da Pilha de Rede (Winsock + TCP/IP + DNS + ARP)',
    category: 'Rede & TCP/IP',
    command: `netsh winsock reset && netsh int ip reset && ipconfig /flushdns && arp -d *`,
    description: 'O macete definitivo para restaurar conectividade quando o computador conecta ao Wi-Fi/cabo mas acusa "Sem Internet" ou DNS_PROBE_FINISHED.',
    elevation: true,
    dangerLevel: 'Baixo',
    practicalTip: 'Executar e reiniciar a máquina. Resolve 90% dos problemas causados por antivírus desinstalados que deixam filtros de LSP do Winsock corrompidos.'
  },
  {
    id: 'cmd-tcp-autotuning',
    title: 'Otimizar Janela de Recebimento TCP (Window Auto-Tuning)',
    category: 'Rede & TCP/IP',
    command: `netsh int tcp set global autotuninglevel=normal && netsh int tcp set global ecncapability=disabled`,
    description: 'Garante que o Windows utilize a largura de banda total da fibra óptica sem limitar a janela de buffers TCP.',
    elevation: true,
    dangerLevel: 'Baixo',
    practicalTip: 'Se a máquina tiver placa de rede gigabit mas fizer downloads a apenas 10-20 Mbps, o autotuning costuma estar em "disabled".'
  },
  {
    id: 'cmd-show-wifi-keys',
    title: 'Revelar Todas as Senhas de Wi-Fi Salvas na Máquina',
    category: 'Rede & TCP/IP',
    command: `netsh wlan show profiles | Select-String -Pattern "Todos os Perfis de Usu|All User Profile" | ForEach-Object { $name = $_.Line.Split(":")[1].Trim(); netsh wlan show profile name="$name" key=clear } | Select-String -Pattern "Nome do Perfil|Profile Name|Conte|Key Content"`,
    description: 'Extrai em texto claro todas as redes Wi-Fi já conectadas neste computador com suas respectivas chaves WPA2/WPA3.',
    elevation: true,
    dangerLevel: 'Baixo',
    practicalTip: 'Inestimável em campo quando o cliente não sabe a senha do roteador local e você precisa conectar outro dispositivo.'
  },

  // 3. Disco & Arquivos
  {
    id: 'cmd-dism-restorehealth',
    title: 'Reparar Component Store Corrompido com DISM Online',
    category: 'Disco & Arquivos',
    command: `DISM.exe /Online /Cleanup-Image /RestoreHealth`,
    description: 'Baixa e substitui componentes corrompidos do diretório WinSxS diretamente dos servidores limpos da Microsoft.',
    elevation: true,
    dangerLevel: 'Baixo',
    practicalTip: 'SEMPRE execute este comando ANTES de rodar o sfc /scannow. Se o repositório base estiver corrompido, o SFC falhará em reparar os arquivos.'
  },
  {
    id: 'cmd-sfc-scannow',
    title: 'Verificador de Arquivos de Sistema (SFC Scannow)',
    category: 'Disco & Arquivos',
    command: `sfc.exe /scannow`,
    description: 'Compara os hashes de todos os binários de sistema protegidos do Windows e substitui versões alteradas ou danificadas pela cópia em cache.',
    elevation: true,
    dangerLevel: 'Baixo',
    practicalTip: 'Verifique os logs de reparo em C:\\Windows\\Logs\\CBS\\CBS.log.'
  },
  {
    id: 'cmd-purge-temp-vss',
    title: 'Limpeza Relâmpago de Arquivos Temporários e Cache de Update',
    category: 'Disco & Arquivos',
    command: `net stop wuauserv & net stop bits & del /f /s /q "%windir%\\SoftwareDistribution\\Download\\*" & del /f /s /q "%temp%\\*" & del /f /s /q "C:\\Windows\\Temp\\*" & net start wuauserv & net start bits`,
    description: 'Libera de 5GB a 30GB de lixo de atualizações do Windows Update que falharam e limpa todas as pastas Temp do sistema.',
    elevation: true,
    dangerLevel: 'Baixo',
    practicalTip: 'Corrige o clássico erro de Windows Update travado em "Instalando 0%" ou "Falha ao instalar atualizações".'
  },
  {
    id: 'cmd-chkdsk-fast',
    title: 'Verificação Rápida de Integridade do Sistema de Arquivos NTFS (Sem Reboot)',
    category: 'Disco & Arquivos',
    command: `chkdsk C: /scan /perf`,
    description: 'Escaneia o volume C: em busca de inconsistências na tabela MFT utilizando prioridade de I/O em tempo real sem travar ou reiniciar o computador.',
    elevation: true,
    dangerLevel: 'Baixo',
    practicalTip: 'Executa em menos de 1 minuto em SSDs NVMe e informa se é realmente necessário agendar o /f /r no boot.'
  },

  // 4. Registro & Tweaks
  {
    id: 'cmd-bypass-win11-hardware',
    title: 'Bypass Completo de Hardware do Windows 11 (TPM, SecureBoot, RAM, CPU)',
    category: 'Registro & Tweaks',
    command: `reg.exe add "HKLM\\SYSTEM\\Setup\\LabConfig" /v BypassTPMCheck /t REG_DWORD /d 1 /f & reg.exe add "HKLM\\SYSTEM\\Setup\\LabConfig" /v BypassSecureBootCheck /t REG_DWORD /d 1 /f & reg.exe add "HKLM\\SYSTEM\\Setup\\LabConfig" /v BypassRAMCheck /t REG_DWORD /d 1 /f & reg.exe add "HKLM\\SYSTEM\\Setup\\LabConfig" /v BypassCPUCheck /t REG_DWORD /d 1 /f & reg.exe add "HKLM\\SYSTEM\\Setup\\LabConfig" /v BypassStorageCheck /t REG_DWORD /d 1 /f`,
    description: 'Cria as chaves LabConfig da Microsoft para instalar ou atualizar o Windows 11 em computadores antigos sem chip TPM 2.0 ou processadores legados.',
    elevation: true,
    dangerLevel: 'Baixo',
    practicalTip: 'Pode ser executado com Shift+F10 durante a instalação limpa do Windows ou no sistema ativo antes de um In-Place Upgrade.'
  },
  {
    id: 'cmd-show-file-extensions',
    title: 'Forçar Exibição de Extensões de Arquivo Conhecidas (.exe, .bat, etc)',
    category: 'Registro & Tweaks',
    command: `reg.exe add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v HideFileExt /t REG_DWORD /d 0 /f & taskkill /f /im explorer.exe & start explorer.exe`,
    description: 'Impede golpes em que arquivos maliciosos usam nomes como "documento.pdf.exe" simulando ser um documento inofensivo.',
    elevation: false,
    dangerLevel: 'Baixo',
    practicalTip: 'Item fundamental do checklist de segurança para qualquer computador virgem ou de cliente.'
  },
  {
    id: 'cmd-disable-web-search-start',
    title: 'Desativar Busca na Web (Bing) e Anúncios no Menu Iniciar',
    category: 'Registro & Tweaks',
    command: `reg.exe add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Search" /v BingSearchEnabled /t REG_DWORD /d 0 /f & reg.exe add "HKCU\\Software\\Policies\\Microsoft\\Windows\\Explorer" /v DisableSearchBoxSuggestions /t REG_DWORD /d 1 /f`,
    description: 'Faz com que a busca do Menu Iniciar responda instantaneamente localizando arquivos do disco, sem enviar termos para os servidores do Bing.',
    elevation: false,
    dangerLevel: 'Baixo',
    practicalTip: 'Remove o lag de 2 segundos ao abrir o menu iniciar para digitar o nome de um programa.'
  },

  // 5. Processos & Watchdogs
  {
    id: 'cmd-abort-shutdown',
    title: 'Abortar Imediatamente Desligamento ou Reinício em Andamento (shutdown -a)',
    category: 'Processos & Watchdogs',
    command: `shutdown.exe /a`,
    description: 'Cancela qualquer temporizador ativo disparado pelo Windows, instalador ou vírus que esteja contando regressivamente para desligar o PC.',
    elevation: true,
    dangerLevel: 'Baixo',
    practicalTip: 'O primeiro comando que deve ser disparado em máquinas que reiniciam em tempo determinado.'
  },
  {
    id: 'cmd-list-reboot-events',
    title: 'Auditar Causa do Último Desligamento (Eventos 1074, 6008 e 41)',
    category: 'Processos & Watchdogs',
    command: `Get-WinEvent -FilterHashtable @{LogName='System'; Id=1074,6008,41} -MaxEvents 10 | Select-Object TimeCreated, Id, @{N="MensagemCurta";E={$_.Message.Split(".")[0]}} | Format-Table -AutoSize`,
    description: 'Examina o Visualizador de Eventos e revela se a máquina foi desligada por usuário, por comando do sistema (1074), por travamento inesperado (6008) ou perda pura de energia (41).',
    elevation: true,
    dangerLevel: 'Baixo',
    practicalTip: 'Se houver evento 41 e a mensagem for BugcheckCode 0, descarte problemas no Windows: a fonte de alimentação ou o conector DC está com mau contato elétrico.'
  },
  {
    id: 'cmd-kill-hung-processes',
    title: 'Finalizar em Massa Todos os Processos com Estado "Not Responding"',
    category: 'Processos & Watchdogs',
    command: `taskkill.exe /f /fi "status eq not responding"`,
    description: 'Varre a tabela de tarefas e extermina silenciosamente qualquer aplicativo ou janela congelada que esteja retendo locks no kernel.',
    elevation: true,
    dangerLevel: 'Baixo',
    practicalTip: 'Evita ter que reiniciar a máquina quando um aplicativo pesado trava o desktop.'
  },

  // 6. Windows 11 OOBE/Bypass
  {
    id: 'cmd-oobe-bypass-nro',
    title: 'Bypass de Conta Microsoft Obrigatória no Windows 11 (OOBE BypassNRO)',
    category: 'Windows 11 OOBE/Bypass',
    command: `oobe\\bypassnro`,
    description: 'Executado na tela de configuração inicial do Windows 11 (Shift+F10). Habilita a opção "Não tenho internet" para criar uma conta local offline pura.',
    elevation: true,
    dangerLevel: 'Baixo',
    practicalTip: 'Essencial para máquinas virgens de clientes corporativos ou sem conexão Wi-Fi ativa na bancada.'
  },
  {
    id: 'cmd-re-register-uwp',
    title: 'Re-Registrar Todos os Aplicativos UWP Nativos (Calculadora, Fotos, Store)',
    category: 'Windows 11 OOBE/Bypass',
    command: `Get-AppXPackage -AllUsers | Foreach {Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\\AppXManifest.xml"}`,
    description: 'Restaura a loja e todos os utilitários de sistema nativos quando eles fecham sozinhos ao abrir ou somem do Windows.',
    elevation: true,
    dangerLevel: 'Baixo',
    practicalTip: 'Roda em segundo plano e reconstrói o catálogo AppX danificado por ferramentas genéricas de debloat.'
  },

  // 7. USB Tethering & Drivers
  {
    id: 'cmd-delete-cpuz-driver',
    title: 'Exterminar Driver de Kernel Invasivo do CPU-Z (cpuz154/cpuz155)',
    category: 'USB Tethering & Drivers',
    command: `sc.exe stop cpuz154 & sc.exe delete cpuz154 & sc.exe stop cpuz155 & sc.exe delete cpuz155 & taskkill /f /im cpuz.exe & del /f /q "%temp%\\cpuz*.sys" 2>nul`,
    description: 'Remove o serviço de ring-0 do CPU-Z registrado em tempo de execução que colide com adaptadores NDIS e causa BSOD instantâneo.',
    elevation: true,
    dangerLevel: 'Baixo',
    practicalTip: 'Executar sempre antes de conectar a ancoragem USB (4G/5G) de celulares Android em PCs onde programas de monitoramento de hardware foram usados.'
  },
  {
    id: 'cmd-reset-rndis-tethering',
    title: 'Resetar Pilha NDIS / RNDIS e Ajustar Buffers de Ancoragem USB',
    category: 'USB Tethering & Drivers',
    command: `reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\RNDISMP\\Parameters" /v MaxPacketsPerMessage /t REG_DWORD /d 1 /f & netsh winsock reset catalog & netsh int ip reset`,
    description: 'Aplica a correção oficial para evitar o estouro de buffer de pacotes em drivers RNDIS quando o Android envia tráfego TCP em alta velocidade.',
    elevation: true,
    dangerLevel: 'Baixo',
    practicalTip: 'Elimina o BugCheck DRIVER_IRQL_NOT_LESS_OR_EQUAL no arquivo rndismpx.sys ou usb8023.sys.'
  }
];
