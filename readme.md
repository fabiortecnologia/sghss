# 📘 SGHSS – Sistema de Gestão Hospitalar e Saúde Simplificada

O **SGHSS** é uma API RESTful desenvolvida em **Node.js**, projetada para fornecer um ambiente seguro, escalável e robusto para o gerenciamento de processos clínicos, incluindo cadastro de pacientes, prontuários, agendamentos e auditoria de ações sensíveis — tudo alinhado às boas práticas de desenvolvimento e à **LGPD**.

---

## 🚀 Funcionalidades Principais

- Cadastro e gestão de pacientes e profissionais (CRUD)
- Autenticação segura via **JWT**
- Agendamento e controle de consultas
- Registro de prontuários e emissão de receitas digitais
- Auditoria completa das ações críticas do sistema
- Documentação via **Swagger**
- Banco de dados PostgreSQL com migrations do Knex.js
- Arquitetura modular e escalável

---

## 🧱 Arquitetura do Projeto

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
│   ├── server.js
│   └── app.js
├── docker-compose.dev.yml
├── knexfile.js
├── package.json
├── .env (criar manualmente)
└── README.md
```

---

## 🛠️ Tecnologias Utilizadas

- **Node.js + Express**
- **PostgreSQL**
- **Knex.js**
- **JWT + bcrypt**
- **Docker**
- **Swagger (OpenAPI 3.0)**

---

## 📌 Requisitos do Sistema

### ✔️ Requisitos Funcionais (RF)

- RF01 — CRUD de pacientes  
- RF02 — CRUD de profissionais  
- RF03 — Autenticação  
- RF04 — Agendamentos  
- RF05 — Prontuários  
- RF06 — Receitas digitais  
- RF07 — Auditoria  
- RF08 — Swagger  
- RF09 — Migrations  

### ✔️ Requisitos Não Funcionais (RNF)

- RNF01 — Segurança (hash, JWT, TLS)  
- RNF02 — LGPD (anonimização e soft delete)  
- RNF03 — Performance com índices  
- RNF04 — Escalabilidade por containers  
- RNF05 — Disponibilidade mínima  
- RNF06 — Log estruturado (observabilidade)  
- RNF07 — Portabilidade via Docker  
- RNF08 — Testabilidade com migrations e seeds  

---

## ⚙️ Configuração do Ambiente

### 🔧 Pré-requisitos obrigatórios

- **Node.js + NPM**
- **Docker** (banco PostgreSQL roda em container)

---

## 🌱 Criando o arquivo `.env`

O arquivo `.env` **não existe no projeto** por motivos de segurança.
Crie-o na raiz do projeto:

```env
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

---

## 🐳 Executando o Banco de Dados com Docker

O arquivo utilizado é o `docker-compose.dev.yml`.

### Comandos do Docker:

```bash
npm run docker:up
```

```bash
npm run docker:down
```

```bash
npm run docker:restart
```

---

## ▶️ Executando a Aplicação

### 1️⃣ Instalar dependências

```bash
npm install
```

### 2️⃣ Rodar migrations e seeds

```bash
npm run migrate
```

```bash
npm run seed
```

### 3️⃣ Iniciar a API

Modo desenvolvimento:

```bash
npm run dev
```

Modo produção:

```bash
npm start
```

A API estará disponível em:

```
http://localhost:3000
```

---

## 📚 Documentação da API

Acesse o Swagger em:

```
http://localhost:3000/docs
```

---

## 🔗 Endpoints Principais

### 🔐 Autenticação

- `POST /auth/login`

### 👤 Pacientes

- `GET /pacientes`
- `POST /pacientes`
- `GET /pacientes/:id`
- `PUT /pacientes/:id`
- `DELETE /pacientes/:id`
- `POST /pacientes/com-usuario`
- `POST /pacientes/:id/criar-usuario`
- `POST /pacientes/:id/anonimizar`

### 🩺 Profissionais

- CRUD completo  
- Criar usuário vinculado  
- Listar profissionais  

### 📅 Agendamentos

- `GET /agendamentos`
- `POST /agendamentos`
- `PATCH /agendamentos/:id/cancelar`
- `PATCH /agendamentos/:id/reagendar`

### 📄 Prontuários

- Criar, editar e consultar  
- Buscar prontuários por paciente  
- Gerar receita digital  

### 📝 Auditoria (ADMIN)

- `GET /auditLogs`

---

## 🛡️ Auditoria do Sistema

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

## ✅ Passo a passo rápido (para iniciantes)

```bash
# 1. Clone o projeto
git clone <url-do-repositorio>
cd sghss-backend

# 2. Crie o arquivo .env manualmente

# 3. Instale dependências
npm install

# 4. Inicie o banco PostgreSQL via Docker
npm run docker:up

# 5. Rode migrations e seeds
npm run migrate
npm run seed

# 6. Inicie a API
npm run dev

# 7. Acesse a documentação
http://localhost:3000/docs
```


