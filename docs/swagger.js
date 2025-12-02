// docs/swagger.js
const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'SGHSS - API',
    version: '1.0.0',
    description:
      'API do Sistema de Gestão Hospitalar e Saúde Simplificada (SGHSS).'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Ambiente de desenvolvimento'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: {
            type: 'string',
            example: 'admin@vidaplus.com.br'
          },
          senha: {
            type: 'string',
            example: 'admin1234!'
          }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          usuario: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              email: { type: 'string', example: 'admin@vidaplus.com.br' },
              papel: { type: 'string', example: 'ADMIN' }
            }
          }
        }
      },
      ProfissionalInput: {
        type: 'object',
        properties: {
          nome: { type: 'string', example: 'Dr. Shaun Murphy' },
          crm: { type: 'string', example: 'CRM-55599' },
          especialidade: { type: 'string', example: 'Neuro' },
          telefone: { type: 'string', example: '11999999988' },
          email: { type: 'string', example: 'shaun.murphy@vidaplus.com' }
        }
      },
      Profissional: {
        allOf: [
          { $ref: '#/components/schemas/ProfissionalInput' },
          {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              ativo: { type: 'boolean', example: true },
              papel: { type: 'string', example: 'PROFESSIONAL' }
            }
          }
        ]
      },
      ProfissionalComUsuarioInput: {
        type: 'object',
        properties: {
          nome: { type: 'string', example: 'Dr. Adao Silva' },
          email: { type: 'string', example: 'adao.silva@vidaplus.com' },
          senha: { type: 'string', example: 'senhaSegura123' },
          crm: { type: 'string', example: 'CRM-95325' },
          especialidade: { type: 'string', example: 'Clinico Geral' },
          telefone: { type: 'string', example: '11999999991' }
        }
      },
      CriarUsuarioProfissionalRequest: {
        type: 'object',
        properties: {
          senha: { type: 'string', example: 'senhaDaAna123' }
        }
      },
      Endereco: {
        type: 'object',
        properties: {
          rua: { type: 'string', example: 'Rua das Flores' },
          numero: { type: 'string', example: '123' },
          cidade: { type: 'string', example: 'São Paulo' },
          estado: { type: 'string', example: 'SP' },
          cep: { type: 'string', example: '04545-123' }
        }
      },
      PacienteInput: {
        type: 'object',
        properties: {
          nome: { type: 'string', example: 'Maria Oliveira Santos' },
          cpf: { type: 'string', example: '12345678900' },
          data_nascimento: { type: 'string', format: 'date', example: '1989-07-12' },
          telefone: { type: 'string', example: '11988776655' },
          email: { type: 'string', example: 'maria.santos@exemplo.com' },
          endereco: { $ref: '#/components/schemas/Endereco' },
          consentimento_lgpd: { type: 'boolean', example: true }
        }
      },
      Paciente: {
        allOf: [
          { $ref: '#/components/schemas/PacienteInput' },
          {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              ativo: { type: 'boolean', example: true }
            }
          }
        ]
      },
      PacienteComUsuarioInput: {
        allOf: [
          { $ref: '#/components/schemas/PacienteInput' },
          {
            type: 'object',
            properties: {
              senha: { type: 'string', example: 'senha123' }
            }
          }
        ]
      },
      CriarUsuarioPacienteRequest: {
        type: 'object',
        properties: {
          senha: { type: 'string', example: 'senhaJoao123' }
        }
      },
      AgendamentoInput: {
        type: 'object',
        properties: {
          paciente_id: { type: 'integer', example: 9 },
          profissional_id: { type: 'integer', example: 4 },
          data_horario: {
            type: 'string',
            example: '10/12/2025 10:00:00',
            description: 'Data no formato DD/MM/YYYY HH:mm:ss'
          },
          duracao_minutos: { type: 'integer', example: 30 },
          tipo: { type: 'string', example: 'Consulta Inicial' },
          observacoes: { type: 'string', example: 'Dores na nuca' }
        }
      },
      Agendamento: {
        allOf: [
          { $ref: '#/components/schemas/AgendamentoInput' },
          {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              status: { type: 'string', example: 'ATIVO' }
            }
          }
        ]
      },
      ReagendarAgendamentoRequest: {
        type: 'object',
        properties: {
          data_horario: {
            type: 'string',
            example: '15/12/2025 09:00:00'
          },
          tipo: { type: 'string', example: 'CONSULTA' },
          duracao_minutos: { type: 'integer', example: 40 },
          observacoes: {
            type: 'string',
            example: 'Reagendado a pedido do paciente'
          }
        }
      },
      ProntuarioInput: {
        type: 'object',
        properties: {
          agendamento_id: { type: 'integer', example: 1 },
          tipo_registro: { type: 'string', example: 'CONSULTA' },
          notas: {
            type: 'string',
            example: 'Paciente relata dor torácica há 3 dias, sem irradiação.'
          },
          prescricoes: {
            type: 'object',
            example: {
              medicamentos: [
                {
                  nome: 'Dipirona 500mg',
                  dose: '1 comprimido',
                  frequencia: '8/8h por 3 dias'
                }
              ]
            }
          },
          anexos: {
            type: 'object',
            example: {
              exames: [{ tipo: 'ECG', url: 'https://exemplo.com/ecg/123.pdf' }]
            }
          },
          visibilidade: {
            type: 'string',
            example: 'COMPARTILHADO'
          }
        }
      },
      AtualizarProntuarioRequest: {
        type: 'object',
        properties: {
          notas: {
            type: 'string',
            example: 'Evolução do quadro: melhora significativa.'
          },
          prescricoes: {
            type: 'object',
            example: {
              medicamento: 'Ibuprofeno 400mg',
              frequencia: '8/8h'
            }
          },
          visibilidade: {
            type: 'string',
            example: 'COMPARTILHADO'
          }
        }
      },
      Prontuario: {
        allOf: [
          { $ref: '#/components/schemas/ProntuarioInput' },
          {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 }
            }
          }
        ]
      },
      AuditLog: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          user_id: { type: 'integer', example: 1 },
          acao: { type: 'string', example: 'CRIACAO_PRONTUARIO' },
          entidade: { type: 'string', example: 'prontuarios' },
          entidade_id: { type: 'integer', example: 10 },
          detalhes: {
            type: 'string',
            example: '{"agendamento_id": 5, "tipo_registro": "CONSULTA"}'
          },
          ip: { type: 'string', example: '127.0.0.1' },
          criado_em: {
            type: 'string',
            format: 'date-time',
            example: '2025-12-01T10:00:00Z'
          }
        }
      },
      AuditLogListResponse: {
        type: 'object',
        properties: {
          pagina: { type: 'integer', example: 1 },
          limite: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 100 },
          registros: {
            type: 'array',
            items: { $ref: '#/components/schemas/AuditLog' }
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Mensagem de erro.' }
        }
      }
    }
  },
  security: [
    {
      BearerAuth: []
    }
  ],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Login do usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Login realizado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' }
              }
            }
          },
          401: {
            description: 'Credenciais inválidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },

    // PROFISSIONAIS
    '/profissionais': {
      get: {
        tags: ['Profissionais'],
        summary: 'Listar profissionais',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de profissionais',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Profissional' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Profissionais'],
        summary: 'Criar profissional',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProfissionalInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Profissional criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Profissional' }
              }
            }
          },
          403: {
            description: 'Acesso negado (somente ADMIN)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/profissionais/{id}': {
      get: {
        tags: ['Profissionais'],
        summary: 'Obter profissional por ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          200: {
            description: 'Profissional encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Profissional' }
              }
            }
          },
          404: {
            description: 'Profissional não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Profissionais'],
        summary: 'Atualizar profissional por ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'Campos a serem atualizados do profissional',
                example: {
                  telefone: '11999999995'
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Profissional atualizado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Profissional' }
              }
            }
          },
          404: {
            description: 'Profissional não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Profissionais'],
        summary: 'Excluir (soft delete) profissional',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          204: {
            description: 'Profissional desativado com sucesso'
          },
          404: {
            description: 'Profissional não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/profissionais/{id}/reativar': {
      patch: {
        tags: ['Profissionais'],
        summary: 'Reativar profissional',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          200: {
            description: 'Profissional reativado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Profissional' }
              }
            }
          },
          404: {
            description: 'Profissional não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/profissionais/com-usuario': {
      post: {
        tags: ['Profissionais - Admin'],
        summary: 'Criar profissional com acesso ao sistema (ADMIN)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProfissionalComUsuarioInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Profissional + usuário criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Profissional' }
              }
            }
          },
          403: {
            description: 'Acesso negado (somente ADMIN)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/profissionais/{id}/criar-usuario': {
      post: {
        tags: ['Profissionais - Admin'],
        summary: 'Criar usuário de acesso para profissional existente (ADMIN)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CriarUsuarioProfissionalRequest'
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Usuário criado para o profissional'
          },
          404: {
            description: 'Profissional não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },

    // PACIENTES
    '/pacientes': {
      get: {
        tags: ['Pacientes'],
        summary: 'Listar pacientes',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de pacientes',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Paciente' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Pacientes'],
        summary: 'Criar paciente',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PacienteInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Paciente criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Paciente' }
              }
            }
          }
        }
      }
    },
    '/pacientes/{id}': {
      get: {
        tags: ['Pacientes'],
        summary: 'Obter paciente por ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Paciente encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Paciente' }
              }
            }
          },
          404: {
            description: 'Paciente não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Pacientes'],
        summary: 'Atualizar paciente por ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'Campos do paciente a atualizar',
                example: {
                  nome: 'Maria O. Santos',
                  telefone: '11977776666',
                  endereco: {
                    rua: 'Av. Brasil',
                    numero: '2000',
                    cidade: 'São Paulo',
                    estado: 'SP'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Paciente atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Paciente' }
              }
            }
          },
          404: {
            description: 'Paciente não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Pacientes'],
        summary: 'Excluir (soft delete) paciente',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          204: { description: 'Paciente desativado com sucesso' },
          404: {
            description: 'Paciente não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/pacientes/com-usuario': {
      post: {
        tags: ['Pacientes - Admin'],
        summary: 'Criar paciente já com acesso ao sistema (ADMIN)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PacienteComUsuarioInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Paciente + usuário criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Paciente' }
              }
            }
          }
        }
      }
    },
    '/pacientes/{id}/criar-usuario': {
      post: {
        tags: ['Pacientes - Admin'],
        summary: 'Criar usuário de acesso para paciente já cadastrado (ADMIN)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CriarUsuarioPacienteRequest'
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Usuário criado para o paciente'
          },
          404: {
            description: 'Paciente não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/pacientes/{id}/anonimizar': {
      post: {
        tags: ['Pacientes - Admin'],
        summary: 'Anonimizar dados do paciente (LGPD, ADMIN)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Paciente anonimizado com sucesso'
          },
          404: {
            description: 'Paciente não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },

    // AGENDAMENTOS
    '/agendamentos': {
      get: {
        tags: ['Agendamentos'],
        summary: 'Listar agendamentos',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de agendamentos',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Agendamento' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Agendamentos'],
        summary: 'Criar agendamento',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AgendamentoInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Agendamento criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Agendamento' }
              }
            }
          }
        }
      }
    },
    '/agendamentos/{id}': {
      get: {
        tags: ['Agendamentos'],
        summary: 'Obter agendamento por ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Agendamento encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Agendamento' }
              }
            }
          },
          404: {
            description: 'Agendamento não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/agendamentos/{id}/cancelar': {
      patch: {
        tags: ['Agendamentos'],
        summary: 'Cancelar agendamento',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Agendamento cancelado com sucesso' },
          404: {
            description: 'Agendamento não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/agendamentos/{id}/reagendar': {
      patch: {
        tags: ['Agendamentos'],
        summary: 'Reagendar consulta',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ReagendarAgendamentoRequest'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Agendamento reagendado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Agendamento' }
              }
            }
          },
          404: {
            description: 'Agendamento não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },

    // PRONTUÁRIOS
    '/prontuarios': {
      post: {
        tags: ['Prontuários'],
        summary: 'Criar prontuário',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProntuarioInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Prontuário criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Prontuario' }
              }
            }
          }
        }
      }
    },
    '/prontuarios/{id}': {
      get: {
        tags: ['Prontuários'],
        summary: 'Obter prontuário por ID (ADMIN ou PROFISSIONAL autorizado)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Prontuário encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Prontuario' }
              }
            }
          },
          404: {
            description: 'Prontuário não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      patch: {
        tags: ['Prontuários'],
        summary: 'Atualizar prontuário (ADMIN ou PROFISSIONAL autorizado)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AtualizarProntuarioRequest'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Prontuário atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Prontuario' }
              }
            }
          },
          404: {
            description: 'Prontuário não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/prontuarios/paciente/{id}': {
      get: {
        tags: ['Prontuários'],
        summary:
          'Listar prontuários de um paciente (paciente ou ADMIN, conforme regra de acesso)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Lista de prontuários do paciente',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Prontuario' }
                }
              }
            }
          }
        }
      }
    },
    '/prontuarios/{id}/receita': {
      get: {
        tags: ['Receitas'],
        summary: 'Emitir/visualizar receita digital baseada no prontuário',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Receita digital emitida/retornada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  description: 'Estrutura da receita em JSON',
                  example: {
                    prontuario_id: 1,
                    paciente: 'João da Silva',
                    profissional: 'Dr. Fulano',
                    prescricoes: [
                      {
                        nome: 'Ibuprofeno 400mg',
                        frequencia: '8/8h'
                      }
                    ],
                    orientacoes: 'Tomar após as refeições.'
                  }
                }
              }
            }
          }
        }
      }
    },

    // AUDIT LOGS
    '/auditLogs': {
      get: {
        tags: ['Auditoria - Admin'],
        summary: 'Listar logs de auditoria (somente ADMIN)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'pagina',
            in: 'query',
            schema: { type: 'integer', default: 1 }
          },
          {
            name: 'limite',
            in: 'query',
            schema: { type: 'integer', default: 20 }
          },
          {
            name: 'acao',
            in: 'query',
            schema: { type: 'string', example: 'CRIACAO_PRONTUARIO' }
          },
          {
            name: 'entidade',
            in: 'query',
            schema: { type: 'string', example: 'prontuarios' }
          },
          {
            name: 'user_id',
            in: 'query',
            schema: { type: 'integer', example: 1 }
          },
          {
            name: 'dataInicio',
            in: 'query',
            schema: { type: 'string', format: 'date', example: '2025-12-01' }
          },
          {
            name: 'dataFim',
            in: 'query',
            schema: { type: 'string', format: 'date', example: '2025-12-31' }
          }
        ],
        responses: {
          200: {
            description: 'Lista de logs de auditoria',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuditLogListResponse' }
              }
            }
          },
          403: {
            description: 'Acesso restrito a administradores',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    }
  }
};

export default swaggerDocument;
