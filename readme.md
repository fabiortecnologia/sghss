# SGHSS – Sistema de Gestão Hospitalar e Saúde Simplificada

Este documento apresenta a descrição técnica, estrutura, instruções de uso e requisitos do **SGHSS – Sistema de Gestão Hospitalar e Saúde Simplificada**, desenvolvido como uma API RESTful em Node.js, com foco em organização, segurança, rastreabilidade e conformidade com boas práticas de desenvolvimento de software e princípios de LGPD (Lei Geral de Proteção de Dados).

---

## 1. Objetivo do Sistema

O SGHSS foi projetado com a finalidade de oferecer uma solução robusta para:

- Gerenciamento de pacientes e profissionais de saúde.
- Controle de agendamentos clínicos.
- Registro estruturado de prontuários.
- Emissão de receitas digitais.
- Auditoria completa das operações críticas realizadas no sistema.
- Aplicação de regras de negócio alinhadas a processos clínicos reais e à LGPD.

---

## 2. Arquitetura da Aplicação

A aplicação segue uma arquitetura modularizada em camadas, organizada da seguinte forma:

```
sghss-backend/
├── docs/
│   └── swagger.js
├── src/
│   ├── config/
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── database.js
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   |── server.js
|   |__ app.js
├── docker-compose.dev.yml
├── knexfile.js
├── package.json
├── .env
└── README.md
```

### Principais Tecnologias Utilizadas

- **Node.js (Express)** – Camada de aplicação e roteamento.
- **PostgreSQL** – Banco de dados relacional.
- **Knex.js** – Query builder e ferramenta de migrations.
- **JWT** – Mecanismo de autenticação.
- **bcrypt** – Hashing seguro de senhas.
- **Docker** – Gerenciamento de ambiente.
- **Swagger** – Documentação estruturada da API.

---

## 3. Requisitos do Sistema

### 3.1 Requisitos Funcionais (RF)

- **RF01** — Cadastro de pacientes (CRUD).
- **RF02** — Cadastro de profissionais (CRUD).
- **RF03** — Autenticação via JWT.
- **RF04** — Agendamento de consultas.
- **RF05** — Registro de prontuários vinculados a consultas.
- **RF06** — Emissão de receitas digitais.
- **RF07** — Auditoria de ações críticas, com registro em `audit_logs`.
- **RF08** — Documentação dos endpoints utilizando Swagger/OpenAPI.
- **RF09** — Migrations automatizadas (Knex).

### 3.2 Requisitos Não Funcionais (RNF)

- **RNF01** — Segurança: hashing de senhas, JWT, e ambiente com suporte a TLS.
- **RNF02** — Conformidade com LGPD: consentimento, soft delete e anonimização.
- **RNF03** — Performance adequada com índices e consultas otimizadas.
- **RNF04** — Escalabilidade horizontal com ambientes containerizados.
- **RNF05** — Disponibilidade mínima esperada e estratégia de backup/monitoramento.
- **RNF06** — Observabilidade mediante logs estruturados.
- **RNF07** — Portabilidade via Docker e Docker Compose.
- **RNF08** — Testabilidade a partir de migrations, seeds e coleção Postman.

---

## 4. Configuração do Ambiente

### 4.1 Variáveis de Ambiente

O projeto utiliza um arquivo `.env` contendo parâmetros sensíveis:

```
DB_CLIENT=pg
DB_HOST=127.0.0.1
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=1234567890
DB_NAME=sghss

JWT_SECRET=chave_secreta
JWT_EXPIRES_IN=3600
REFRESH_TOKEN_DAYS=30

PORT=3000
```

### 4.2 Ambiente com Docker

O banco de dados é iniciado através do arquivo `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 1234567890
      POSTGRES_DB: sghss
    ports:
      - "5433:5432"
    volumes:
      - pgdata_dev:/var/lib/postgresql/data

volumes:
  pgdata_dev:
```

### Comandos úteis:

```bash
npm run docker:up      # Inicia o banco
npm run docker:down    # Derruba contêineres
npm run docker:restart # Reinicia
```

---

## 5. Execução da Aplicação

### Instalação:

```bash
npm install
```

### Execução:

```bash
npm start      # Modo de execução
npm run dev    # Modo desenvolvimento com nodemon
npm run docker:dev #Modo desenvolvimento nodemom + docker
```

### Migrations:

```bash
npm run migrate
npm run rollback
npm run seed
```

---

## 6. Documentação da API (Swagger)

A API está documentada conforme o padrão **OpenAPI 3.0** no arquivo:

```
/docs/swagger.js
```

Para acessar a documentação via interface gráfica:

```
http://localhost:3000/docs
```

---

## 7. Principais Endpoints

### 7.1 Autenticação

- `POST /auth/login`

### 7.2 Pacientes

- `GET /pacientes`
- `POST /pacientes`
- `GET /pacientes/:id`
- `PUT /pacientes/:id`
- `DELETE /pacientes/:id`
- `POST /pacientes/com-usuario`
- `POST /pacientes/:id/criar-usuario`
- `POST /pacientes/:id/anonimizar`

### 7.3 Profissionais

- `GET /profissionais`
- `POST /profissionais`
- `GET /profissionais/:id`
- `PUT /profissionais/:id`
- `DELETE /profissionais/:id`
- `POST /profissionais/com-usuario`
- `POST /profissionais/:id/criar-usuario`

### 7.4 Agendamentos

- `GET /agendamentos`
- `POST /agendamentos`
- `GET /agendamentos/:id`
- `PATCH /agendamentos/:id/cancelar`
- `PATCH /agendamentos/:id/reagendar`

### 7.5 Prontuários

- `POST /prontuarios`
- `GET /prontuarios/:id`
- `PATCH /prontuarios/:id`
- `GET /prontuarios/paciente/:id`
- `GET /prontuarios/:id/receita`

### 7.6 Auditoria

- `GET /auditLogs` — acesso restrito ao perfil **ADMIN**.

---

## 8. Auditoria do Sistema

Todas as ações sensíveis são registradas em `audit_logs`, incluindo:

- Criação, edição e exclusão de prontuários.
- Ações administrativas.
- Operações de criação de usuários.

Exemplo de registro:

```js
await trx('audit_logs').insert({
  user_id: userId,
  acao: 'CRIACAO_PRONTUARIO',
  entidade: 'prontuarios',
  entidade_id: prontuario.id,
  detalhes: JSON.stringify({ agendamento_id, tipo_registro }),
  ip: req.ip,
  criado_em: trx.fn.now()
});
```

---

## 9. Considerações Finais

Este sistema foi construído visando atender a requisitos funcionais e não funcionais voltados à gestão clínica moderna, garantindo segurança, rastreabilidade, boa arquitetura e facilidade de manutenção. A documentação estruturada, conjunto de migrations, uso de Docker e logs de auditoria asseguram que a solução é robusta e adequada a ambientes reais.

---

**SGHSS – Sistema de Gestão Hospitalar e Saúde Simplificada**  
Documentação Técnica – Versão 1.0.0
