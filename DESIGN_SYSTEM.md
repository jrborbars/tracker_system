# 🎨 Design System — Eisenmenger Care Tracker
**Sistema de Monitoramento Satelital e Apoio Familiar para Síndrome de Eisenmenger**

---

## 1. 🎯 Propósito e Contexto do Produto

A **Síndrome de Eisenmenger** é uma condição congênita cardiopulmonar complexa que causa hipertensão arterial pulmonar severa e inversão de fluxo sanguíneo (cianose), exigindo atenção constante a episódios de hipóxia, desmaios, arritmias e necessidade de localização e socorro imediatos.

O **Eisenmenger Care Tracker** é uma aplicação voltada para **familiares e cuidadores**, cujo objetivo primordial é:
1. **Localizar rapidamente** a pessoa via satélite/GPS em qualquer situação de emergência.
2. **Monitorar a segurança** através de zonas seguras (*geofences* com alertas automáticos).
3. **Oferecer tranquilidade visual**: uma interface acolhedora, sem ruído visual, com paleta de tons pastéis calmantes que reduzem o estresse e a ansiedade dos familiares.

---

## 2. 🧱 Pilares de Design e Filosofia Visual

1. **Material Design Limpo (Sem Libs Pesadas):**
   - Construído 100% com **CSS Puro** utilizando propriedades nativas modernas (variáveis CSS, CSS Grid e Flexbox).
   - Superfícies claras, bordas arredondadas e sombras suaves de elevação para sensação de profundidade e leveza.

2. **Hierarquia e Legibilidade Médica:**
   - Dados vitais de rastreamento (bateria, sinal de satélite, última coordenada, status da zona) em destaque instantâneo.
   - Botão de **Localização Rápida de Emergência (Quick SOS / Locate)** com acesso em 1 clique em todas as telas.

3. **Tons Pastéis Humanizados (Pastel Health Palette):**
   - Substituição de cores hospitalares frias ou alarmistas por tons suaves e equilibrados que transmitem cuidado, segurança e clareza.

---

## 3. 🎨 Paleta de Cores (Pastel Healthcare Tokens)

| Categoria | Nome do Token | Valor Hex | Aplicação / Significado |
| :--- | :--- | :--- | :--- |
| **Primária (Saúde/Calma)** | `--color-primary` | `#00897B` | Ações principais, destaques, navegação |
| | `--color-primary-light` | `#E0F2F1` | Fundo de cartões de status, badges positivos |
| | `--color-primary-dark` | `#004D40` | Textos e ênfases em botões |
| **Secundária (Cuidado Familiar)** | `--color-secondary` | `#7E57C2` | Recursos de apoio, perfil, rotas familiares |
| | `--color-secondary-light` | `#EDE7F6` | Fundos acolhedores, cartões de cuidadores |
| **Emergência / Alerta Crítico** | `--color-danger` | `#E53935` | SOS, saída de zona segura, bateria crítica |
| | `--color-danger-light` | `#FFEBEE` | Fundo de alertas críticos de emergência |
| | `--color-danger-border` | `#FFCDD2` | Bordas suaves de cartões de emergência |
| **Atenção / Advertência** | `--color-warning` | `#FB8C00` | Bateria baixa (20%), sinal oscilando |
| | `--color-warning-light` | `#FFF3E0` | Fundo de badges de advertência |
| **Sucesso / Seguro** | `--color-success` | `#43A047` | Dentro da Zona Segura, sinal estável |
| | `--color-success-light` | `#E8F5E9` | Badges de status normal e seguro |
| **Neutros e Superfícies** | `--bg-canvas` | `#F8FAFC` | Fundo geral da aplicação |
| | `--bg-surface` | `#FFFFFF` | Cartões, modais e superfícies elevadas |
| | `--bg-surface-subtle` | `#F1F5F9` | Divisores, fundos de inputs e tabelas |
| **Tipografia Neutra** | `--text-main` | `#1E293B` | Texto principal de alta legibilidade |
| | `--text-muted` | `#64748B` | Rótulos secundários, timestamps, unidades |
| | `--text-light` | `#94A3B8` | Placeholders e textos auxiliares |

---

## 4. 🔤 Tipografia — Roboto

* **Família Principal:** `'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
* **Importação Google Fonts:** Pesos `300` (Light), `400` (Regular), `500` (Medium), `700` (Bold).

---

## 5. 📐 Sistema de Layout: CSS Grid e Flexbox

O layout utiliza **CSS Grid para macro-estruturas** e **Flexbox para micro-alinhamentos**:

* **Macro-Estrutura (CSS Grid):** Divisão em 3 colunas principais (Lista de Familiares/SOS + Mapa Central + Feed de Alertas e Telemetria).
* **Micro-Alinhamentos (Flexbox):** Centralização de ícones, badges, botões e barras de status de bateria/sinal.

---

## 6. 🔘 Componentes do Design System

1. **Botão de Emergência Rápida (SOS Quick Locate):**
   - Efeito de pulso animado em coral pastel (`#FFEBEE` / `#E53935`).
   - Foco imediato nas coordenadas do ente querido e chamada para socorro médico.
2. **Cartão de Protocolo Eisenmenger:**
   - Exibe dados vitais rápidos, tipo sanguíneo, cardiologista responsável e orientações de emergência.
3. **Marcador de Satélite com Radar Pulse:**
   - Indicador visual no mapa com anel concêntrico animado indicando precisão do sinal GPS.
4. **Badges de Zonas Seguras (Geofence):**
   - Chips pastéis indicando se o paciente está em casa, na clínica ou em deslocamento.
5. **Indicadores de Telemetria:**
   - Barra de bateria com cores contextuais (verde > 50%, âmbar 20-50%, vermelho < 20%).
