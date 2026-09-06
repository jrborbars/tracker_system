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
6. **Planos & Pagamentos Integrados**: Assinaturas integradas ao **Mercado Pago** com suporte a Pix Instantâneo (QR Code EMV) e Cartão de Crédito/Débito.
7. **Ergonomia Mobile-First**: Bottom Navigation Bar nativa com 3 abas essenciais no rodapé e menu de utilidades acessível via avatar.

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
   - **Mobile / Tablet**: Bottom Navigation bar ergonômica com 3 opções principais no rodapé (*Mapa*, *Indoor*, *Notificações*) e menu popover/gaveta no avatar do topo.

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
| **Mercado Pago (Azul MP)** | `--color-mp-blue` | `#009EE3` | `#38BDF8` | Badges de checkout, botões Pix e MP |
| | `--color-mp-light` | `#E0F7FF` | `#0C4A6E` | Fundo de instruções Pix e QR Code |
| **Neutros & Superfícies** | `--bg-canvas` | `#F8FAFC` | `#0B0F17` | Fundo geral da aplicação |
| | `--bg-surface` | `#FFFFFF` | `#151D2A` | Cartões, gavetas laterais e modais |
| | `--bg-surface-subtle` | `#F1F5F9` | `#1E293B` | Inputs, divisores e fundos de tabelas |
| | `--border-color` | `#E2E8F0` | `#273549` | Linhas delimitadoras e contornos |
| | `--border-light` | `#EEF2F6` | `#1E293B` | Separadores internos de listas |
| **Tipografia Neutra** | `--text-main` | `#1E293B` | `#F1F5F9` | Leitura principal de alto contraste |
| | `--text-muted` | `#64748B` | `#94A3B8` | Rótulos secundários e timestamps |
| | `--text-light` | `#94A3B8` | `#64748B` | Textos auxiliares e hints terciários |

---

## 4. 🔤 Tipografia & Fontes

### 4.1. Famílias Tipográficas
* **Fonte Principal (UI & Textos):** `'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
  * Carregada via Google Fonts nos pesos `300 (Light)`, `400 (Regular)`, `500 (Medium)`, `700 (Bold)`, `900 (Black)`.
* **Fonte Monospaçada (Telemetria, UUIDs & Chaves Pix):** `'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace`
  * Utilizada para coordenadas GPS, tokens de sessão, códigos IMEI de rastreadores e payloads EMV Pix.

### 4.2. Escala Modular de Texto
* **Display / Título Principal (H1):** `24px - 28px` | Peso `700 (Bold)`
* **Seções / Cabeçalhos (H2):** `18px - 20px` | Peso `700 / 500`
* **Subtítulos / Card Titles (H3):** `15px - 16px` | Peso `700 / 500`
* **Corpo / Leitura (Body):** `14px - 15px` | Peso `400 (Regular)`
* **Legendas / Metadados (Caption):** `12px - 13px` | Peso `400 / 500`
* **Badges / Chips:** `11px - 12px` | Peso `700 (Bold)` com `letter-spacing: 0.5px`

---

## 5. 🏷️ Catálogo de Ícones (FontAwesome 6)

O sistema utiliza **FontAwesome 6 Free** com ícones padronizados semanticamente:

### 5.1. Saúde & Emergência
* `fa-heart-pulse`: Logo do sistema e sinais vitais cardíacos.
* `fa-triangle-exclamation`: Alerta de saída de cerca ou queda detectada.
* `fa-crosshairs`: Botão Quick SOS e centralização de emergência.
* `fa-shield-halved`: Zona segura ativa e proteção LGPD.
* `fa-lungs`: Monitor de oximetria e protocolo de oxigênio.

### 5.2. Telemetria & Rastreamento
* `fa-satellite-dish` / `fa-satellite`: Sinal satelital GPS/GLONASS.
* `fa-location-dot`: Ponto geográfico do paciente / marcador no mapa.
* `fa-house-signal` / `fa-wifi`: Presença Indoor e Beacons BLE RSSI.
* `fa-battery-full` / `fa-battery-three-quarters` / `fa-battery-quarter`: Níveis de carga do rastreador.
* `fa-route`: Histórico de trajeto e trilha de deslocamento.

### 5.3. Pagamento & Mercado Pago
* `fa-pix`: Pagamento Pix instantâneo com QR Code.
* `fa-credit-card`: Cartão de Crédito e Débito.
* `fa-qrcode`: Código QR para leitura no app bancário.
* `fa-lock`: Segurança SSL e tokenização Mercado Pago.
* `fa-receipt`: Comprovante e confirmação de webhook.

### 5.4. Interface & Ações
* `fa-sun` / `fa-moon`: Alternador de Modo Claro e Escuro.
* `fa-eye` / `fa-eye-slash`: Revelador/ocultador de senha nos formulários.
* `fa-bolt`: Atalho de preenchimento de conta de demonstração.
* `fa-key`: Recuperação de senha ("Esqueci a senha").
* `fa-arrow-right-from-bracket`: Logout seguro da sessão.

---

## 6. 📐 Sistema de Layout & Navegação

### 6.1. Desktop: Sidebar Desdobrável (Expandida vs. Compacta)
* **Modo Expandido (`260px`):** Exibe logotipo completo, rótulos de navegação, contadores de notificações, botão de tema (☀️/🌙) e status de GPS no rodapé.
* **Modo Compacto (`78px`):** Otimiza o espaço na tela com foco no mapa, ícones centralizados e botões de toque direto.

### 6.2. Mobile: Bottom Navigation Bar + Header Avatar Menu
* **Rodapé Fixo (Bottom Bar):** Contém as **3 abas essenciais**:
  1. 🗺️ **Mapa Satelital** (`fa-map-location-dot`)
  2. 🏠 **Monitoramento Indoor** (`fa-house-signal`)
  3. 🔔 **Notificações & Alertas** (`fa-bell` com badge numérico)
* **Topo Mobile (Header):**
  - Logotipo Betterdays.
  - Botão de Emergência **Quick SOS**.
  - Avatar do Cuidador com badge de status.
* **Menu do Avatar (Drawer/Popover):**
  - Alternador de **Modo Escuro / Claro**.
  - **Perfil do Cuidador & Protocolo Clínico**.
  - **Planos & Assinatura (Mercado Pago)**.
  - **Gerenciar Rastreadores**.
  - **Chat da Família (Grupos de Cuidado)**.
  - **Sair com Segurança**.

---

## 7. 🧩 Catálogo Completo de Componentes

### 7.1. Módulo de Autenticação (Login & Cadastro)
* **Floating Labels (Estilo Material Design / Gmail):** O rótulo flutua suavemente para a borda superior ao focar ou preencher o campo.
* **Olho de Visibilidade da Senha:** Alterna entre `password` e `text` em um clique.
* **Atalho de Demonstração Rápida:** Botão com ícone de raio que preenche as credenciais demo com 1 toque.
* **Ações Secundárias Limpas:**
  - Link *Esqueci a senha* abrindo modal de instruções.
  - Link *Não tem uma conta? Cadastre-se* que alterna instantaneamente para os campos de cadastro (*Nome*, *Telefone*, *E-mail*, *Senha*).
* **Modais de Termos de Uso e Política de Privacidade (LGPD).**

### 7.2. Módulo de Mapa Satelital (`LeafletMapView`)
* **Seletor de Camadas:** CartoDB Positron (Claro), CartoDB Dark Matter (Escuro) e Satélite Esri.
* **Marcador Concêntrico Pulsante (`@keyframes pulse-ring`):** Indica precisão do GPS e status ativo.
* **Cercas Virtuais (Geofences):** Círculos e polígonos com edição de raio em tempo real e avisos de entrada/saída.
* **Cartão de Telemetria:** Bateria com indicador contextual por cor, velocidade, altitude, precisão em metros e satélites visíveis.

### 7.3. Módulo de Monitoramento Indoor (`IndoorMonitoringView`)
* **Planta Baixa Residencial Interativa:** Grade representativa dos cômodos (Sala, Quarto, Banheiro, Cozinha, Varanda).
* **Sensor RSSI / BLE:** Barra de força de sinal por cômodo e detecção de presença.
* **Detector Anti-Queda (*Fall Detection*):** Alerta sonoro/visual em caso de impacto ou síncope súbita.
* **Painel de Sinais Vitais:** Frequência Cardíaca (bpm) e Saturação de Oxigênio (SpO2 %) ajustada para Síndrome de Eisenmenger.

### 7.4. Módulo de Grupos de Cuidado (`CareGroupsChatView`)
* **Interface Estilo WhatsApp:** Balões de conversa do remetente e destinatário com duplo check (`✓✓`).
* **Canais Especializados:** *Família Mariana*, *Cardiologia InCor*, *Plantão SOS*, *Farmácia & Oxigênio*.
* **Compartilhamento de Localização GPS em 1 Toque:** Envio de mapa estático e coordenadas diretamente no chat.

### 7.5. Módulo de Planos & Checkout Mercado Pago (`SubscriptionPlansModal`)
* **3 Níveis de Assinatura:**
  1. **Essencial (Gratuito):** 1 rastreador, 1 cerca virtual, histórico 24h.
  2. **Familiar Pro (R$ 49,90/mês):** Rastreadores ilimitados, cercas ilimitadas, IA preditiva, histórico 30 dias.
  3. **Hospital / Clínica (R$ 149,90/mês):** Multi-pacientes, integração InCor e telemetria avançada.
* **Checkout Pix Instantâneo:** QR Code dinâmico, código Pix Copia e Cola, chave EMV e contador regressivo de 15 minutos.
* **Checkout Cartão de Crédito/Débito:** Formatação automática (16 dígitos), detecção inteligente de bandeira (Visa, Mastercard, Elo, Amex), CVV e parcelamento até 12x.

---

## 8. ♿ Acessibilidade & Contraste

* Todos os textos respeitam a taxa mínima de contraste **WCAG 2.1 AA** (mínimo `4.5:1` para texto padrão e `3.0:1` para elementos grandes e ícones ativos).
* Navegação por teclado completa em formulários flutuantes e modais.
* Indicadores de foco visíveis em botões (`:focus-visible`).
* Notificações e alertas sonoros acompanhados sempre de feedback visual duplo (ícone + cor de status + texto explícito).
