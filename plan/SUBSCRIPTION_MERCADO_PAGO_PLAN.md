# Plano de Implementação: Planos de Assinatura & Pagamento com Mercado Pago

Este documento estabelece a arquitetura, modelo de domínio, fluxo de pagamento e plano de execução para introduzir planos de assinatura (SaaS) no sistema **Betterdays Tracker** com gateway de pagamento integrado via **Mercado Pago** (PIX instantâneo, Cartão de Crédito e Checkout Pro).

---

## 1. Visão Geral da Funcionalidade

O sistema permitirá que cuidadores, familiares e clínicas assinem planos de monitoramento contínuo para desbloquear limites adicionais de relógios pareados, telemetria satelital em tempo real de alta frequência, gravação contínua de rotas e histórico estendido de saúde.

### Planos de Assinatura Propostos:
1. **Gratuito / Essencial (Free Tier)**:
   - 1 Dispositivo/Relógio pareado
   - 2 Cercas virtuais
   - Chat de cuidado básico
   - Histórico de 24 horas

2. **Cuidado Familiar (Plano Popular - R$ 29,90/mês ou R$ 299/ano)**:
   - Até 3 Dispositivos/Relógios
   - Cercas virtuais ilimitadas
   - Notificações nativas PWA e SMS/Push prioritário
   - Histórico de telemetria e oximetria de 30 dias
   - Suporte a múltiplos cuidadores na mesma conta

3. **Clínico & Especialistas (Plano Pro - R$ 79,90/mês ou R$ 799/ano)**:
   - Até 10 Dispositivos
   - Integração completa com prontuário médico e exportação em PDF/CSV
   - Monitoramento Indoor com planta baixa e visão multipaciente
   - SLA de suporte prioritário 24/7

---

## 2. Métodos de Pagamento (Mercado Pago)
- **PIX Instantâneo**: Geração de QR Code e código Copia-e-Cola com confirmação em tempo real via WebSocket/Webhook.
- **Cartão de Crédito**: Cobrança transparente com parcelamento ou assinatura recorrente.
- **Checkout Pro (Link Seguro Mercado Pago)**: Alternativa de checkout hospedado oficial do Mercado Pago para máxima conversão e segurança.

---

## 3. Decisões de Arquitetura

Mantendo o padrão de **Clean Architecture / Modular** do projeto:

```
frontend/src/modules/subscription/
├── domain/
│   ├── subscriptionModel.js        # Regras de planos, limites, formatação de preços e cálculo de ciclo
│   └── subscriptionModel.test.js   # Testes unitários do modelo
├── infrastructure/
│   └── subscriptionRepository.js   # Comunicação HTTP com os endpoints de assinatura
└── presentation/
    ├── SubscriptionPlansModal.jsx  # Modal visual de escolha e upgrade de plano
    ├── MercadoPagoCheckout.jsx     # Interface de pagamento PIX (QR Code) e Cartão
    └── SubscriptionBadge.jsx       # Badge do plano atual no menu do usuário
```

```
backend/src/
├── routes/
│   └── subscriptions.js            # Rotas /api/subscriptions/plans, /checkout, /status, /webhook
├── services/
│   └── mercadoPagoService.js       # Wrapper com credenciais do Mercado Pago (Access Token / Public Key)
└── tests/
    └── subscriptions.test.js       # Testes automatizados das rotas e webhook
```

---

## 4. Mudanças Propostas

### Backend

#### [NEW] `backend/src/services/mercadoPagoService.js`
- Criação de preferências de checkout (`/checkout/preferences`).
- Criação de pagamentos Pix direto (`/v1/payments`).
- Consulta de status de transações e validação de Webhooks.

#### [NEW] `backend/src/routes/subscriptions.js`
- `GET /api/subscriptions/plans` — Lista planos e preços vigentes.
- `GET /api/subscriptions/current` — Consulta a assinatura e limites ativos do usuário autenticado.
- `POST /api/subscriptions/create-preference` — Cria checkout Mercado Pago ou gera chave PIX.
- `POST /api/subscriptions/webhook` — Recebe notificações do Mercado Pago e atualiza a assinatura do usuário em tempo real.

#### [MODIFY] `backend/src/app.js`
- Registro das rotas `/api/subscriptions`.

#### [MODIFY] `backend/src/db.js` e `backend/src/seed.js`
- Adição dos campos `subscription: { plan: 'family', status: 'active', expiresAt: ... }` na estrutura do usuário.

---

### Frontend

#### [NEW] `frontend/src/modules/subscription/domain/subscriptionModel.js`
- Funções puras para verificar permissões de recursos (ex: `canAddDevice(currentCount, plan)`).

#### [NEW] `frontend/src/modules/subscription/infrastructure/subscriptionRepository.js`
- Métodos `getPlans()`, `getCurrentSubscription()`, `createCheckoutPreference(planId, cycle)`.

#### [NEW] `frontend/src/modules/subscription/presentation/SubscriptionPlansModal.jsx`
- Modal com troca Mensal/Anual (desconto), cards de benefícios limpos, comparativo de recursos e acionamento do Mercado Pago.

#### [NEW] `frontend/src/modules/subscription/presentation/MercadoPagoCheckout.jsx`
- Tela com QR Code PIX, botão "Copiar Código PIX", timer de expiração e simulação de pagamento em ambiente de testes.

#### [MODIFY] `frontend/src/core/components/UserAvatarMenu.jsx`
- Adição da opção "Meu Plano / Assinatura" com badge do plano ativo e botão de Upgrade.

#### [MODIFY] `frontend/src/core/i18n/infrastructure/locales/{pt,en,es}.js`
- Adição das chaves de tradução i18n para planos, benefícios e fluxo de pagamento.

---

## 5. Plano de Verificação

### Testes Automatizados
- **Backend**: Novos testes em `backend/src/tests/subscriptions.test.js` cobrindo listagem de planos, criação de checkout e webhook do Mercado Pago.
- **Frontend**: Testes unitários em `subscriptionModel.test.js` validando regras de limites por plano.
- **Suíte Geral**: `npm test` garantindo 100% de aprovação.

### Verificação Manual
1. Abrir o menu do usuário e clicar em "Meu Plano / Assinatura".
2. Testar seleção de planos (Mensal e Anual).
3. Gerar pagamento via PIX (QR Code e Copia-e-Cola).
4. Simular confirmação de pagamento e conferir a atualização do plano e desbloqueio de limites em tempo real.
5. Alternar entre modo claro e escuro para assegurar conformidade visual.
