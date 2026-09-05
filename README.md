# 🛰️ Eisenmenger Care Tracker — Sistema de Monitoramento Satelital

Sistema completo para **monitoramento satelital e apoio a familiares de pessoas com Síndrome de Eisenmenger**. O projeto possui arquitetura desacoplada e organizada em duas frentes:

1. 📂 **`backend/` (Node.js + Express):** Mock completo da API REST (`betterdays_tracker`), com autenticação JWT, rastreamento de dispositivos GPS, cercas virtuais (*geofences*), telemetria simulada e upload de arquivos.
2. 📂 **`frontend/` (React + Vite):** Aplicação web construída em **Material Design limpo**, **CSS Grid e Flexbox puros**, ícones **FontAwesome 6**, tipografia **Roboto** e paleta de cores em **tons pastéis**.

> ⚠️ **Nota de Segurança:** O backend mock utiliza credenciais e segredos exclusivamente locais para testes e desenvolvimento, sem dependências de ambientes de produção.

---

## 🚀 Como Executar o Projeto

Pré-requisito: **Node.js `>= 20`**.

### Executar a partir da raiz (Atalhos):

```bash
# Iniciar o Back-end (http://localhost:8000)
npm start

# Iniciar o Front-end (http://localhost:5173)
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
npm start          # Inicia na porta http://localhost:8000
# ou 'npm run dev' para modo auto-reload
```
- **Health check:** `http://localhost:8000/health`
- **Root API banner:** `http://localhost:8000/`

#### 2. Front-end (`frontend/`)
```bash
cd frontend
npm install
npm run dev        # Inicia a interface web em http://localhost:5173
```

---

## 🎨 Design System & Identidade Visual

O projeto conta com documentação e showcase visual dedicados:
* 📄 **Documentação de Decisões:** [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)
* 🌐 **Showcase Visual Interativo (HTML):** [`design_system.html`](./design_system.html) *(abra diretamente no navegador)*

### Princípios do Front-end:
* **Paleta em Tons Pastéis:**
  * 🌿 **Menta Suave / Teal Saúde (`#00897B`, `#E0F2F1`):** Calma e estabilidade clínica.
  * 💜 **Lavanda Acolhedora (`#7E57C2`, `#EDE7F6`):** Apoio e cuidado familiar.
  * 🚨 **Coral Emergência / SOS (`#E53935`, `#FFEBEE`):** Localização rápida e alertas críticos.
  * ☀️ **Âmbar Atenção (`#FB8C00`, `#FFF3E0`):** Bateria baixa e avisos de sinal.
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
├── backend/                   # Back-end Mock Express
│   ├── src/                   # Código-fonte da API
│   │   ├── server.js          # Entry point do servidor
│   │   ├── app.js             # Middlewares e configuração Express
│   │   ├── config.js          # Configurações e segredos mock
│   │   ├── db.js              # In-memory store
│   │   ├── seed.js            # Seed inicial com demo user
│   │   ├── auth.js            # JWT e requireAuth
│   │   ├── telemetry.js       # Simulação MQTT/GPS
│   │   └── routes/            # Rotas (auth, devices, areas, etc.)
│   ├── test/                  # 33 testes com node:test e supertest
│   ├── scripts/               # Scripts auxiliares (mint-token)
│   ├── uploads/               # Armazenamento de mídia
│   └── package.json           # Dependências do backend
├── frontend/                  # Front-end React + Vite
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
├── DESIGN_SYSTEM.md           # Definição e decisões do Design System
├── design_system.html         # Showcase visual interativo dos componentes
├── package.json               # Scripts raiz para orquestração
└── README.md                  # Documentação principal
```
