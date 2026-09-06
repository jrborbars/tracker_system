# 🎨 Design System — Betterdays
**Sistema de Monitoramento Satelital, Indoor & Apoio Familiar para Síndrome de Eisenmenger**

---

## 1. 🎯 Propósito e Contexto do Produto

A **Síndrome de Eisenmenger** é uma condição congênita cardiopulmonar complexa caracterizada por hipertensão arterial pulmonar severa e inversão do fluxo sanguíneo (shunt da direita para a esquerda), resultando em cianose crônica, arritmias, intolerância a esforços, desmaios súbitos (síncope) e episódios agudos de hipóxia.

O **Betterdays** é uma plataforma concebida para **familiares, cuidadores e profissionais de saúde**, cujo objetivo primordial é:
1. **Localização Instantânea Multicanal**: Rastreamento satelital preciso (GPS / GLONASS / Galileo) em áreas abertas e monitoramento interno (*Indoor Beacon / Wi-Fi RSSI*) para segurança dentro de casa.
2. **Segurança Ativa & Cercas Virtuais (*Geofencing*)**: Notificações instantâneas ao entrar ou sair de perímetros seguros (Residência, Hospital/Clínica Cardiológica, etc.).
3. **Grupos de Cuidado estilo WhatsApp**: Comunicação em tempo real em grupos dedicados (*Família*, *Cardiologia InCor*, *Plantão SOS*, *Oxigenioterapia*).
4. **Modo Claro & Modo Escuro (*Dark Mode Dual Tokens*)**: Acolhimento visual tanto para uso diurno quanto para vigília noturna de cuidadores, reduzindo a fadiga ocular.
5. **Protocolo Clínico em 1 Clique**: Acesso imediato a contatos médicos de urgência, histórico de oxigenioterapia e orientações em caso de emergência.

---

## 2. 🧱 Pilares de Design e Filosofia Visual

1. **Material Design Limpo & Autônomo (Sem Frameworks Pesados):**
   - Construído com **CSS Puro moderno** (CSS Custom Properties, CSS Grid e Flexbox nativos).
   - Superfícies claras ou Deep Slate, cantos arredondados equilibrados e sombras sutis de elevação.

2. **Tema Noturno Integrado (Dark Mode Healthcare Palette):**
   - Baseado em **Deep Slate (`#0B0F17` / `#151D2A`)** com contrastes luminosos em Teal (`#14B8A6`), Lavanda (`#A78BFA`), Coral (`#F87171`) e Verde Esmeralda (`#4ADE80`).
   - Mapa Satelital adapta-se automaticamente para tiles **CartoDB Dark Matter**, minimizando a emissão de luz azul em quartos hospitalares ou residenciais durante a noite.

3. **Hierarquia Médica & Usabilidade em Emergência:**
   - Dados vitais de telemetria (bateria, satélites visíveis, precisão em metros, tempo de sinal) visíveis sem esforço cognitivo.
   - Botão **Quick SOS / Localizar Agora** proeminente e acessível em um único clique em todas as telas.

4. **Responsividade & Adaptabilidade de Navegação:**
   - **Desktop**: Sidebar expansível/compacta (260px ↔ 78px) com alternador de tema e status de GPS.
   - **Mobile / Tablet**: Bottom Navigation bar ergonômica com foco nos dedos e mapas em evidência total (*full-bleed*).

---

## 3. 🎨 Paleta de Cores e Tokens Duais (Light & Dark Mode)

O sistema utiliza a variável `[data-theme="dark"]` na raiz do documento HTML para alternância instantânea sem recarregamento de página.

| Categoria | Token CSS | Modo Claro (Light) | Modo Escuro (Dark) | Significado & Aplicação |
| :--- | :--- | :--- | :--- | :--- |
| **Primária (Saúde / Menta)** | `--color-primary` | `#00897B` | `#14B8A6` | Ações principais, rotas, destaques |
| | `--color-primary-light` | `#E0F2F1` | `#134E4A` | Fundo de itens ativos, badges |
| | `--color-primary-subtle` | `#B2DFDB` | `#115E59` | Bordas suaves e anéis de foco |
| | `--color-primary-dark` | `#004D40` | `#5EEAD4` | Textos em destaque e estados ativos |
| **Secundária (Cuidado / Lavanda)** | `--color-secondary` | `#7E57C2` | `#A78BFA` | Apoio familiar, perfil e cuidadores |
| | `--color-secondary-light` | `#EDE7F6` | `#2E1065` | Fundos de cards secundários |
| | `--color-secondary-subtle` | `#D1C4E9` | `#4C1D95` | Bordas e acentos de cards secundários |
| | `--color-secondary-dark` | `#4527A0` | `#DDD6FE` | Títulos e ênfases do módulo familiar |
| **Emergência / SOS (Coral)** | `--color-danger` | `#E53935` | `#F87171` | Botão SOS, saída de cerca, bateria crítica |
| | `--color-danger-light` | `#FFEBEE` | `#450A0A` | Fundos de alertas críticos e pulse radar |
| | `--color-danger-subtle` | `#FFCDD2` | `#7F1D1D` | Bordas de banners de perigo |
| | `--color-danger-dark` | `#B71C1C` | `#FECACA` | Texto de erro e botões ativos de SOS |
| **Atenção (Âmbar Suave)** | `--color-warning` | `#FB8C00` | `#FBBF24` | Bateria baixa (<20%), satélite oscilando |
| | `--color-warning-light` | `#FFF3E0` | `#451A03` | Fundos de avisos de manutenção |
| | `--color-warning-subtle` | `#FFE082` | `#78350F` | Bordas e realces de advertência |
| | `--color-warning-dark` | `#E65100` | `#FEF08A` | Textos e ícones de alerta de bateria |
| **Sucesso / Seguro (Verde)** | `--color-success` | `#43A047` | `#4ADE80` | Paciente na zona segura, sinal forte |
| | `--color-success-light` | `#E8F5E9` | `#064E3B` | Badges de status normal e conexões |
| | `--color-success-subtle` | `#C8E6C9` | `#065F46` | Bordas de confirmação de status |
| | `--color-success-dark` | `#1B5E20` | `#BBF7D0` | Textos de confirmação de segurança |
| **Neutros & Superfícies** | `--bg-canvas` | `#F8FAFC` | `#0B0F17` | Fundo geral da aplicação |
| | `--bg-surface` | `#FFFFFF` | `#151D2A` | Cartões, gavetas laterais e modais |
| | `--bg-surface-subtle` | `#F1F5F9` | `#1E293B` | Inputs, divisores e fundos de tabelas |
| | `--border-color` | `#E2E8F0` | `#273549` | Linhas delimitadoras e contornos |
| | `--border-light` | `#EEF2F6` | `#1E293B` | Separadores internos de listas |
| **Tipografia Neutra** | `--text-main` | `#1E293B` | `#F1F5F9` | Leitura principal de alto contraste |
| | `--text-muted` | `#64748B` | `#94A3B8` | Rótulos secundários e timestamps |
| | `--text-light` | `#94A3B8` | `#64748B` | Textos auxiliares e hints terciários |

---

## 4. 🔤 Tipografia — Roboto

* **Família Principal:** `'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
* **Escala Modular de Texto:**
  * **Display / Título Principal (H1):** `24px - 28px` | Peso `700 (Bold)`
  * **Seções / Cabeçalhos (H2):** `18px - 20px` | Peso `700 / 500`
  * **Subtítulos / Card Titles (H3):** `15px - 16px` | Peso `700 / 500`
  * **Corpo / Leitura (Body):** `14px - 15px` | Peso `400 (Regular)`
  * **Legendas / Metadados (Caption):** `12px - 13px` | Peso `400 / 500`
  * **Badges / Chips:** `11px - 12px` | Peso `700 (Bold)` com `letter-spacing: 0.5px`

---

## 5. 📐 Sistema de Layout & Navegação

### 5.1. Sidebar Desdobrável (Expandida vs. Compacta)
* **Modo Expandido (`260px`):** Exibe logotipo completo, rótulos completos de abas, contadores de notificações, botão de tema (☀️/🌙) e status de GPS no rodapé.
* **Modo Compacto (`78px`):** Otimiza o espaço na tela com foco no mapa, ícones centralizados e botões de toque direto.

### 5.2. Visualização Indoor (Planta Baixa & Beacons)
* Grade representativa dos cômodos da residência (Sala de Estar, Quarto Principal, Banheiro, Cozinha, etc.).
* Sensores RSSI / BLE com status de presença em tempo real e sensor anti-queda.

### 5.3. Visualização Outdoor (Mapa Satelital Leaflet)
* Camadas alternáveis: **CartoDB Positron (Light)** / **CartoDB Dark Matter (Dark)** / **Satélite Esri**.
* Marcadores concêntricos pulsantes indicando precisão do sinal em metros.

### 5.4. Chat de Grupos de Cuidado (Estilo WhatsApp)
* Comunicação segmentada por canais: *Família Mariana*, *Cardiologia InCor*, *Plantão SOS*, *Farmácia & Oxigênio*.
* Balões de mensagem com duplo check (`✓✓`), cards de telemetria GPS e botões de disparo de ação em 1 toque.

---

## 6. 🧩 Componentes Vitais do Sistema

1. **Botão de Emergência Rápida (SOS Quick Locate):**
   - Botão de alta visibilidade com animação pulsante concêntrica (`@keyframes pulse-ring`).
   - Centraliza o mapa instantaneamente nas últimas coordenadas e aciona rota de socorro.
2. **Cartão de Protocolo Clínico Eisenmenger:**
   - Exibe cardiologista responsável, diretrizes de oxigenioterapia e tipo sanguíneo.
3. **Indicador de Telemetria e Bateria:**
   - Barra de bateria inteligente com coloração contextual (Verde > 50%, Âmbar 20-50%, Vermelho < 20%).
4. **Badges de Zonas Seguras (*Geofence Chips*):**
   - Identificadores visuais com ícones para indicar se o paciente está em casa, na clínica ou fora de perímetro seguro.
5. **Modal de Cadastro de Rastreador:**
   - Formulário com validação de código UUID / IMEI e vínculo de canal de telemetria.
6. **Menu do Usuário / Cuidador:**
   - Drawer com foto de perfil, alternador de Modo Escuro, dados de conta e atalhos rápidos de configuração e logout seguro.
