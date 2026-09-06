/**
 * docs/swagger.js
 * Especificação OpenAPI 3.0.3 completa e renderizadores de Swagger UI e ReDoc.
 */
import { Router } from 'express';

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Betterdays Tracker System — REST & Real-time Telemetry API',
    description: `API de Telemetria Médica, Rastreamento Satelital (GPS), Monitoramento Interno de Saúde (BLE/Indoor), Cercas Virtuais e Assinaturas com Mercado Pago.
    
### Recursos Principais:
* 🔐 **Autenticação JWT** (Bearer Token)
* 📍 **Gestão de Rastreadores & Dispositivos** (Localização, Bateria, Oximetria, Detecção de Queda)
* 🛡️ **Cercas Virtuais (Geofencing)** (Áreas circulares com alertas de entrada/saída)
* 🔔 **Mensageria & Alertas** (Protocolos de emergência SOS, alertas vitais)
* 👤 **Perfil do Cuidador & Protocolo Médico** (Síndrome de Eisenmenger, Hospital, Contato Médico)
* 💳 **Assinaturas & Mercado Pago** (PIX Instantâneo, Cartão de Crédito e Débito, Webhooks)
`,
    version: '1.2.0',
    contact: {
      name: 'Suporte Betterdays',
      email: 'suporte@betterdays.com',
      url: 'https://betterdays.com',
    },
    license: {
      name: 'Proprietary / Betterdays Tecnologia Assistiva',
    },
  },
  servers: [
    {
      url: 'http://localhost:8000',
      description: 'Servidor de Desenvolvimento Local (Mock & API)',
    },
  ],
  tags: [
    { name: 'Autenticação', description: 'Registro de cuidadores, login e geração de tokens JWT' },
    { name: 'Perfil do Cuidador', description: 'Dados cadastrais, upload de foto e protocolo médico de emergência' },
    { name: 'Rastreadores (Dispositivos)', description: 'Gestão de relógios e clips GPS/BLE, telemetria e oximetria' },
    { name: 'Cercas Virtuais (Áreas)', description: 'Configuração de perímetros seguros (geofencing)' },
    { name: 'Mensagens & Alertas', description: 'Histórico de notificações, chamados SOS e alertas de telemetria' },
    { name: 'Assinaturas & Mercado Pago', description: 'Planos SaaS, pagamentos via PIX, Cartão de Crédito/Débito e Webhooks' },
    { name: 'Sistema & Telemetria', description: 'Health check, métricas Prometheus e dados brutos de geofencing' },
  ],
  paths: {
    '/register': {
      post: {
        tags: ['Autenticação'],
        summary: 'Cadastrar novo cuidador / usuário',
        operationId: 'registerUser',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuário cadastrado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
          400: {
            description: 'Email já existente ou dados inválidos',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Autenticar cuidador e gerar Token JWT',
        operationId: 'loginUser',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login efetuado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
          },
          401: {
            description: 'Credenciais inválidas',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/profile': {
      get: {
        tags: ['Perfil do Cuidador'],
        summary: 'Obter dados do perfil e protocolo médico do usuário autenticado',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Dados do perfil do cuidador',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserProfile' },
              },
            },
          },
          401: { description: 'Não autorizado' },
        },
      },
      put: {
        tags: ['Perfil do Cuidador'],
        summary: 'Atualizar dados do perfil, senha e protocolo médico',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProfileUpdateRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Perfil atualizado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserProfile' },
              },
            },
          },
          401: { description: 'Não autorizado' },
        },
      },
    },
    '/upload/': {
      post: {
        tags: ['Perfil do Cuidador'],
        summary: 'Upload de foto de perfil (Multipart/form-data)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Upload realizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    url: { type: 'string', example: '/uploads/photo_123.jpg' },
                    filename: { type: 'string', example: 'photo_123.jpg' },
                  },
                },
              },
            },
          },
          400: { description: 'Arquivo inválido ou extensão não permitida' },
        },
      },
    },
    '/devices/': {
      get: {
        tags: ['Rastreadores (Dispositivos)'],
        summary: 'Listar todos os rastreadores e relógios do usuário',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de dispositivos com telemetria ativa',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Device' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Rastreadores (Dispositivos)'],
        summary: 'Cadastrar e parear novo rastreador',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DeviceCreate' },
            },
          },
        },
        responses: {
          201: {
            description: 'Dispositivo cadastrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Device' },
              },
            },
          },
          400: { description: 'Device ID já existente ou inválido' },
        },
      },
    },
    '/devices/{id}': {
      put: {
        tags: ['Rastreadores (Dispositivos)'],
        summary: 'Atualizar informações de um rastreador existente',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DeviceUpdate' },
            },
          },
        },
        responses: {
          200: { description: 'Dispositivo atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Device' } } } },
          404: { description: 'Dispositivo não encontrado' },
        },
      },
      delete: {
        tags: ['Rastreadores (Dispositivos)'],
        summary: 'Remover rastreador pareado',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Dispositivo removido com sucesso' },
          404: { description: 'Dispositivo não encontrado' },
        },
      },
    },
    '/areas/': {
      get: {
        tags: ['Cercas Virtuais (Áreas)'],
        summary: 'Listar todas as cercas virtuais configuradas',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de áreas seguras',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Area' },
                },
              },
            },
          },
        },
      },
    },
    '/areas/{deviceId}': {
      post: {
        tags: ['Cercas Virtuais (Áreas)'],
        summary: 'Criar nova cerca virtual para um dispositivo',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'deviceId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AreaCreate' },
            },
          },
        },
        responses: {
          201: { description: 'Área criada com sucesso', content: { 'application/json': { schema: { $ref: '#/components/schemas/Area' } } } },
          404: { description: 'Dispositivo não encontrado' },
        },
      },
    },
    '/areas/{deviceId}/{areaId}': {
      put: {
        tags: ['Cercas Virtuais (Áreas)'],
        summary: 'Atualizar cerca virtual existente',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'deviceId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'areaId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AreaCreate' },
            },
          },
        },
        responses: {
          200: { description: 'Área atualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Area' } } } },
          404: { description: 'Área não encontrada' },
        },
      },
      delete: {
        tags: ['Cercas Virtuais (Áreas)'],
        summary: 'Remover cerca virtual',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'deviceId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'areaId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Área removida' },
          404: { description: 'Área não encontrada' },
        },
      },
    },
    '/messages/': {
      get: {
        tags: ['Mensagens & Alertas'],
        summary: 'Listar alertas, notificações e chamados de cuidado',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de mensagens e alertas',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Message' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Mensagens & Alertas'],
        summary: 'Criar nova mensagem de alerta ou chamada médica',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MessageCreate' },
            },
          },
        },
        responses: {
          201: { description: 'Mensagem criada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        },
      },
    },
    '/subscriptions/plans': {
      get: {
        tags: ['Assinaturas & Mercado Pago'],
        summary: 'Listar todos os planos SaaS e métodos de pagamento disponíveis',
        responses: {
          200: {
            description: 'Planos disponíveis',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PlansResponse' },
              },
            },
          },
        },
      },
    },
    '/subscriptions/current': {
      get: {
        tags: ['Assinaturas & Mercado Pago'],
        summary: 'Obter status da assinatura ativa do usuário e limites de uso',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Assinatura e limites de uso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CurrentSubscriptionResponse' },
              },
            },
          },
        },
      },
    },
    '/subscriptions/create-preference': {
      post: {
        tags: ['Assinaturas & Mercado Pago'],
        summary: 'Gerar transação de pagamento no Mercado Pago (PIX ou Checkout Pro)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePreferenceRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Dados da transação gerada com sucesso (PIX Copia-e-Cola ou Link Checkout Pro)',
          },
        },
      },
    },
    '/subscriptions/pay-card': {
      post: {
        tags: ['Assinaturas & Mercado Pago'],
        summary: 'Processar pagamento transparente com Cartão de Crédito ou Débito',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PayCardRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Pagamento autorizado e assinatura ativada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Pagamento com cartão de crédito aprovado!' },
                    paymentId: { type: 'string', example: 'mp_cc_1788726555' },
                    subscription: { $ref: '#/components/schemas/Subscription' },
                  },
                },
              },
            },
          },
          400: { description: 'Dados do cartão inválidos ou recusados' },
        },
      },
    },
    '/subscriptions/webhook': {
      post: {
        tags: ['Assinaturas & Mercado Pago'],
        summary: 'Webhook oficial do Mercado Pago para confirmação de transações',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
        responses: {
          200: { description: 'Webhook processado com sucesso' },
        },
      },
    },
    '/health': {
      get: {
        tags: ['Sistema & Telemetria'],
        summary: 'Verificação de integridade da API e conexão MQTT',
        responses: {
          200: {
            description: 'API operando normalmente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    mqtt: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'connected' },
                        broker: { type: 'string', example: 'mock.local' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/metrics': {
      get: {
        tags: ['Sistema & Telemetria'],
        summary: 'Exportador de métricas no padrão Prometheus',
        responses: {
          200: {
            description: 'Métricas de telemetria em formato texto',
            content: { 'text/plain': { schema: { type: 'string' } } },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token JWT gerado na rota /login no formato: Bearer <token>',
      },
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email', example: 'cuidador@betterdays.com' },
          password: { type: 'string', minLength: 6, example: 'senhaSegura123' },
          name: { type: 'string', example: 'Dr. Vagner Ibas' },
          phone: { type: 'string', example: '(11) 98765-4321' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'demo@betterdays.com' },
          password: { type: 'string', example: 'password123' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          token_type: { type: 'string', example: 'bearer' },
          user: { $ref: '#/components/schemas/UserProfile' },
        },
      },
      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          email: { type: 'string', example: 'demo@betterdays.com' },
          name: { type: 'string', example: 'Demo Caregiver' },
          phone: { type: 'string', example: '(11) 98765-4321' },
          photo_url: { type: 'string', example: '/uploads/profile.jpg' },
          doctor_contact: { type: 'string', example: 'Dr. Carlos Mendonça • Tel: (11) 98765-4321' },
          hospital_reference: { type: 'string', example: 'Instituto do Coração (InCor) • Pronto-Socorro 24h' },
          patient_diagnosis: { type: 'string', example: 'Paciente cianótico crônico (Síndrome de Eisenmenger).' },
        },
      },
      ProfileUpdateRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          password: { type: 'string', minLength: 6 },
          doctor_contact: { type: 'string' },
          hospital_reference: { type: 'string' },
          patient_diagnosis: { type: 'string' },
        },
      },
      Device: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          device_id: { type: 'string', example: 'TRCK-10001' },
          name: { type: 'string', example: 'Relógio Vô João' },
          latitude: { type: 'number', example: -23.55052 },
          longitude: { type: 'number', example: -46.633308 },
          battery_level: { type: 'integer', example: 85 },
          heart_rate: { type: 'integer', example: 74 },
          spo2: { type: 'integer', example: 98 },
          fall_detected: { type: 'boolean', example: false },
          status: { type: 'string', example: 'online' },
          last_seen: { type: 'string', format: 'date-time' },
        },
      },
      DeviceCreate: {
        type: 'object',
        required: ['device_id', 'name'],
        properties: {
          device_id: { type: 'string', example: 'TRCK-30003' },
          name: { type: 'string', example: 'Relógio Dona Maria' },
          type: { type: 'string', example: 'watch' },
        },
      },
      DeviceUpdate: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Relógio Vô João (Casa)' },
          device_id: { type: 'string', example: 'TRCK-10001' },
        },
      },
      Area: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          device_id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Casa & Jardim' },
          center_lat: { type: 'number', example: -23.55052 },
          center_lng: { type: 'number', example: -46.633308 },
          radius_meters: { type: 'integer', example: 150 },
          is_active: { type: 'boolean', example: true },
        },
      },
      AreaCreate: {
        type: 'object',
        required: ['name', 'center_lat', 'center_lng', 'radius_meters'],
        properties: {
          name: { type: 'string', example: 'Parque Ibirapuera' },
          center_lat: { type: 'number', example: -23.58741 },
          center_lng: { type: 'number', example: -46.65763 },
          radius_meters: { type: 'integer', example: 300 },
        },
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          device_id: { type: 'integer', example: 1 },
          text: { type: 'string', example: 'Alerta: Paciente saiu da cerca Casa & Jardim' },
          timestamp: { type: 'string', format: 'date-time' },
          active: { type: 'boolean', example: true },
        },
      },
      MessageCreate: {
        type: 'object',
        required: ['device_id', 'text'],
        properties: {
          device_id: { type: 'integer', example: 1 },
          text: { type: 'string', example: 'Alerta médico manual' },
        },
      },
      PlansResponse: {
        type: 'object',
        properties: {
          currency: { type: 'string', example: 'BRL' },
          supportedPaymentMethods: {
            type: 'array',
            items: { type: 'string' },
            example: ['pix', 'credit_card', 'debit_card', 'mercado_pago_checkout'],
          },
          plans: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'family' },
                name: { type: 'string', example: 'Cuidado Familiar' },
                priceMonthly: { type: 'number', example: 29.90 },
                priceYearly: { type: 'number', example: 299.00 },
                maxDevices: { type: 'integer', example: 3 },
                maxGeofences: { type: 'integer', example: 999 },
                historyDays: { type: 'integer', example: 30 },
                popular: { type: 'boolean', example: true },
                features: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
          },
        },
      },
      CurrentSubscriptionResponse: {
        type: 'object',
        properties: {
          subscription: { $ref: '#/components/schemas/Subscription' },
          usage: {
            type: 'object',
            properties: {
              devicesCount: { type: 'integer', example: 2 },
              devicesLimit: { type: 'integer', example: 3 },
              areasCount: { type: 'integer', example: 1 },
              areasLimit: { type: 'integer', example: 999 },
            },
          },
        },
      },
      Subscription: {
        type: 'object',
        properties: {
          planId: { type: 'string', example: 'family' },
          planName: { type: 'string', example: 'Cuidado Familiar' },
          status: { type: 'string', example: 'active' },
          cycle: { type: 'string', example: 'monthly' },
          maxDevices: { type: 'integer', example: 3 },
          maxGeofences: { type: 'integer', example: 999 },
          historyDays: { type: 'integer', example: 30 },
          expiresAt: { type: 'string', format: 'date-time' },
          paymentMethod: { type: 'string', example: 'mercado_pago_pix' },
        },
      },
      CreatePreferenceRequest: {
        type: 'object',
        required: ['planId'],
        properties: {
          planId: { type: 'string', example: 'family' },
          cycle: { type: 'string', enum: ['monthly', 'yearly'], default: 'monthly' },
          paymentType: { type: 'string', enum: ['pix', 'checkout_pro'], default: 'pix' },
        },
      },
      PayCardRequest: {
        type: 'object',
        required: ['planId', 'cardData'],
        properties: {
          planId: { type: 'string', example: 'family' },
          cycle: { type: 'string', enum: ['monthly', 'yearly'], default: 'monthly' },
          cardData: {
            type: 'object',
            required: ['cardNumber', 'holderName', 'expiry', 'cvv'],
            properties: {
              cardNumber: { type: 'string', example: '4532117088991234' },
              holderName: { type: 'string', example: 'VAGNER IBAS' },
              expiry: { type: 'string', example: '12/28' },
              cvv: { type: 'string', example: '123' },
              cpf: { type: 'string', example: '12345678909' },
              brand: { type: 'string', example: 'Visa' },
              cardType: { type: 'string', enum: ['credit', 'debit'], default: 'credit' },
              installments: { type: 'integer', default: 1 },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          detail: { type: 'string', example: 'Mensagem de erro detalhada' },
        },
      },
    },
  },
};

/**
 * Gera o template HTML standalone do Swagger UI
 */
export function renderSwaggerUI() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Betterdays Tracker — Swagger API Docs</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css">
  <link rel="icon" type="image/svg+xml" href="/uploads/logo.svg">
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .topbar { display: none !important; }
    .swagger-ui .info .title { font-size: 28px; color: #0D9488; }
    .swagger-ui .btn.authorize { background-color: #0D9488; border-color: #0D9488; color: #fff; }
    .swagger-ui .btn.authorize svg { fill: #fff; }
    .swagger-ui .opblock.opblock-post { border-color: #0D9488; background: rgba(13, 148, 136, 0.05); }
    .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #0D9488; }
    .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #0284c7; }
    .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #d97706; }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #dc2626; }
    .custom-banner {
      background: linear-gradient(135deg, #0f172a 0%, #134e4a 100%);
      color: #fff;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
    }
    .custom-banner h1 { margin: 0; font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
    .custom-banner a { color: #5eead4; text-decoration: none; font-size: 13px; font-weight: 600; }
    .custom-banner a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="custom-banner">
    <h1>🛡️ Betterdays Tracker API Documentation</h1>
    <div style="display: flex; gap: 16px;">
      <a href="/openapi.json" target="_blank">📄 OpenAPI Spec (JSON)</a>
      <a href="/redoc">📖 ReDoc UI</a>
      <a href="http://localhost:5173" target="_blank">🚀 Abrir Frontend Web</a>
    </div>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "/openapi.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`;
}

/**
 * Gera o template HTML do ReDoc UI
 */
export function renderRedocUI() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <title>Betterdays Tracker — ReDoc API Documentation</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
  <style>
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  <redoc spec-url='/openapi.json'></redoc>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</body>
</html>`;
}

const router = Router();

// Endpoint OpenAPI JSON
router.get('/openapi.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  return res.json(openApiSpec);
});

// Endpoint Swagger UI
router.get('/docs', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(renderSwaggerUI());
});

// Endpoint ReDoc
router.get('/redoc', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(renderRedocUI());
});

export default router;
