# 🛰️ Betterdays — Sistema de Monitoramento Satelital e Apoio Familiar

Sistema completo para **monitoramento satelital, telemetria clínica e apoio a familiares de pessoas com Síndrome de Eisenmenger**. O projeto possui arquitetura desacoplada e organizada em duas frentes:

1. 📂 **`backend/` (Node.js + Express + Socket.io):** Mock completo da API REST (`betterdays_tracker`) e servidor WebSocket em tempo real, com autenticação JWT, rastreamento de dispositivos GPS, cercas virtuais (*geofences*), telemetria simulada via broadcast e upload de arquivos.
2. 📂 **`frontend/` (React + Vite + Socket.io Client):** Aplicação web construída em **Material Design limpo**, **CSS Grid e Flexbox puros**, suporte a **Modo Escuro / Claro**, chat estilo **WhatsApp Grupos de Cuidado**, ícones **FontAwesome 6**, tipografia **Roboto** e paleta de cores em **tons pastéis**.

> ⚠️ **Nota de Segurança:** O backend mock utiliza credenciais e segredos exclusivamente locais para testes e desenvolvimento, sem dependências de ambientes de produção.

---

## 📡 Mensageria em Tempo Real & Telemetria (Socket.io)

O Betterdays utiliza **WebSockets via Socket.io** para comunicação bidirecional de altíssima velocidade (<20ms):
* 💬 **Grupos de Cuidado (Estilo WhatsApp):** Chat em tempo real entre familiares, médicos (InCor) e farmácia, com indicador de digitação (*typing status*) e confirmação de leitura (`✓✓`).
* 🚨 **Disparo de Emergência SOS Global:** Broadcast instantâneo para todos os cuidadores conectados ao acionar o botão de socorro.
* 📍 **Telemetria Satelital Contínua:** Transmissão de coordenadas GPS e nível de bateria sem necessidade de recarregamento de página.

> 📖 **Documentação Técnica Completa:** Veja [`MESSAGING_ARCHITECTURE.md`](./MESSAGING_ARCHITECTURE.md) para o dicionário de eventos, payloads, hooks React e estratégias de reconexão.

---

## 📱 Progressive Web App (PWA — Desktop & Mobile)

O sistema conta com suporte a **PWA instalável** em Desktop (Windows, macOS, Linux) e Mobile (Android, iOS):
* 📲 **Execução Standalone:** Sem barras do navegador, com visual e comportamento de app nativo.
* ⚡ **Service Worker Inteligente:** Estratégia de cache híbrida (*Stale-While-Revalidate* e fallback offline).
* 🎯 **Atalhos Rápidos:** Acesso direto via menu de contexto no ícone (Mapa, Rastreadores, Monitoramento Interno).

> 📖 **Guia & Documentação PWA:** Veja [`PWA.md`](./PWA.md) para detalhes de arquitetura, Service Worker, manifesto e instruções de instalação.

---

## 🚀 Como Executar o Projeto

Pré-requisito: **Node.js `>= 20`**.

### Executar a partir da raiz (Atalhos):

```bash
# Iniciar o Back-end com Socket.io (http://localhost:8000)
npm start

# Iniciar o Front-end React (http://localhost:5173)
npm run dev

# Executar a suíte de testes unitários do backend
npm test
```

---

### Executar entrando em cada pasta:

#### 1. Back-end (`backend/`)
```bash
cd backend
npm install
npm start          # Inicia na porta http://localhost:8000 (HTTP + WebSockets)
# ou 'npm run dev' para modo auto-reload
```
- **Health check:** `http://localhost:8000/health`
- **Root API banner:** `http://localhost:8000/`
- **WebSocket Endpoint:** `ws://localhost:8000/socket.io/`

#### 2. Front-end (`frontend/`)
```bash
cd frontend
npm install
npm run dev        # Inicia a interface web em http://localhost:5173
```

---

## 🎨 Design System & Identidade Visual

O projeto conta com documentação e showcase visual dedicados:
* 📄 **Documentação de Decisões e Tokens:** [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)
* 🌐 **Showcase Visual Interativo (HTML):** [`design_system.html`](./design_system.html) *(com seletor interativo de Modo Claro / Escuro)*

### Princípios do Front-end:
* ☀️/🌙 **Modo Claro e Modo Escuro:** Alternador integrado com persistência no `localStorage` e mapas satelitais adaptativos (CartoDB Positron / Dark Matter).
* **Paleta em Tons Pastéis & Alto Contraste Noturno:**
  * 🌿 **Menta Suave / Luminous Teal (`#00897B` / `#2DD4BF`):** Calma e estabilidade clínica.
  * 💜 **Lavanda Acolhedora / Night Lavender (`#7E57C2` / `#A78BFA`):** Apoio e cuidado familiar.
  * 🚨 **Coral Emergência / SOS (`#E53935` / `#F87171`):** Localização rápida e alertas críticos.
  * ☀️ **Âmbar Atenção (`#FB8C00` / `#FBBF24`):** Bateria baixa e avisos de sinal.
* **Tipografia:** Fonte **Roboto** (Google Fonts).
* **Ícones:** **FontAwesome 6 Free** (`@fortawesome/fontawesome-free`).
* **Layout Puro:** 100% **CSS Grid** para macro-estrutura e **Flexbox** para micro-alinhamentos.

---

## 👤 Credenciais e Demonstração

| Campo | Valor |
| --- | --- |
| **E-mail de Teste** | `demo@betterdays.com` |
| **Senha** | `password123` |
| **Rastreadores Demo** | `Delivery Van 01` (`TRCK-10001`), `Tractor Fleet Unit` (`TRCK-20002`) |

---

## 📁 Estrutura Organizada do Repositório

```
tracker_system/
├── backend/                   # Back-end Mock Express + Socket.io
│   ├── src/                   # Código-fonte da API e WebSocket Server
│   │   ├── server.js          # Entry point do servidor HTTP e WebSocket
│   │   ├── socket.js          # Servidor Socket.io para chat e telemetria
│   │   ├── app.js             # Middlewares e configuração Express
│   │   ├── config.js          # Configurações e segredos mock
│   │   ├── db.js              # In-memory store
│   │   ├── seed.js            # Seed inicial com demo user
│   │   ├── auth.js            # JWT e requireAuth
│   │   ├── telemetry.js       # Simulação MQTT/GPS com broadcast Socket.io
│   │   └── routes/            # Rotas (auth, devices, areas, etc.)
│   ├── test/                  # 33 testes com node:test e supertest
│   ├── scripts/               # Scripts auxiliares (mint-token)
│   ├── uploads/               # Armazenamento de mídia
│   └── package.json           # Dependências do backend
├── frontend/                  # Front-end React + Vite (Clean Architecture + DDD)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── README.md              # Documentação completa do Frontend e guia rápido
│   └── src/
│       ├── core/              # Camada Core: HTTP Client, Sockets, Base Layout & Hooks
│       │   ├── api/           # httpClient centralizado com JWT e interceptors
│       │   ├── services/      # Singletons de infra (socketService, notificationService)
│       │   ├── hooks/         # Hooks globais (useNetworkStatus)
│       │   └── components/    # Layout compartilhado (Sidebar, BottomNav, UserAvatarMenu)
│       ├── modules/           # Módulos de Domínio (DDD Bounded Contexts)
│       │   ├── auth/          # Autenticação (LoginView, authRepository)
│       │   ├── care-chat/     # Chat e Comunicação em tempo real (CareGroupsChatView, useCareSocket)
│       │   ├── tracking/      # Rastreamento GPS, Mapas e Geofences (LeafletMapView, TrackerManagementView)
│       │   ├── indoor/        # Monitoramento Interno de Cômodos (IndoorMonitoringView)
│       │   ├── profile/       # Perfil do Usuário e Foto (ProfileView, profileRepository)
│       │   └── dashboard/     # Orquestrador das views (MainApp)
│       ├── api/               # Façade retrocompatível delegando aos repositórios
│       └── styles/            # Estilos globais (theme.css, index.css)
├── MERCADO_PAGO_INTEGRATION.md# Guia Oficial de Pagamentos (PIX, Cartão Crédito/Débito)
├── JSON_DATA_ARCHITECTURE.md   # Arquitetura de Dados, Contratos JSON e Schemas REST/WS
├── MESSAGING_ARCHITECTURE.md  # Arquitetura detalhada de WebSockets / Mensageria
├── PWA.md                     # Documentação técnica e guia do Progressive Web App
├── DESIGN_SYSTEM.md           # Definição e decisões do Design System
├── design_system.html         # Showcase visual interativo dos componentes
├── package.json               # Scripts raiz para orquestração
└── README.md                  # Documentação principal
```
