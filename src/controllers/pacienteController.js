import bcrypt from 'bcrypt';
import db from '../config/database.js';

// GET /pacientes
export const listar = async (req, res) => {
  try {
    const pacientes = await db('pacientes')
      .where({ ativo: true })
      .select('id', 'nome', 'email', 'telefone', 'data_nascimento');

    return res.json(pacientes);
  } catch (err) {
    console.error('Erro ao listar pacientes:', err);
    return res.status(500).json({ error: 'Erro ao listar pacientes' });
  }
};

// GET /pacientes/:id
export const obterPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const paciente = await db('pacientes')
      .where({ id, ativo: true })
      .first();

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    return res.json(paciente);
  } catch (err) {
    console.error('Erro ao buscar paciente:', err);
    return res.status(500).json({ error: 'Erro ao buscar paciente' });
  }
};

// POST /pacientes
export const criar = async (req, res) => {
  const {
    nome,
    cpf,
    data_nascimento,
    telefone,
    email,
    endereco,
    consentimento_lgpd
  } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  if (!cpf) {
    return res.status(400).json({ error: 'Cpf é obrigatório' });
  }

  try {
    const [novo] = await db('pacientes')
      .insert({
        nome,
        cpf_criptografado: cpf || null, // por enquanto sem criptografia
        data_nascimento: data_nascimento || null,
        telefone: telefone || null,
        email: email || null,
        endereco: endereco || null, // pode ser objeto json
        consentimento_lgpd: !!consentimento_lgpd
      })
      .returning('*');

    return res.status(201).json(novo);
  } catch (err) {
    console.error('Erro ao criar paciente:', err);
    return res.status(400).json({ error: 'Erro ao criar paciente', details: err.message });
  }
};

// PUT /pacientes/:id
export const atualizar = async (req, res) => {
  const { id } = req.params;
  const {
    nome,
    cpf,
    data_nascimento,
    telefone,
    email,
    endereco,
    consentimento_lgpd
  } = req.body;

  try {
    const [paciente] = await db('pacientes')
      .where({ id })
      .update(
        {
          nome,
          cpf_criptografado: cpf || null,
          data_nascimento: data_nascimento || null,
          telefone: telefone || null,
          email: email || null,
          endereco: endereco || null,
          consentimento_lgpd:
            consentimento_lgpd !== undefined ? !!consentimento_lgpd : undefined,
          atualizado_em: db.fn.now()
        },
        '*'
      );

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    return res.json(paciente);
  } catch (err) {
    console.error('Erro ao atualizar paciente:', err);
    return res.status(400).json({ error: 'Erro ao atualizar paciente', details: err.message });
  }
};

// DELETE /pacientes/:id  -> soft delete
export const remover = async (req, res) => {
  const { id } = req.params;

  try {
    const afetados = await db('pacientes')
      .where({ id })
      .update({ ativo: false, atualizado_em: db.fn.now() });

    if (!afetados) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    return res.status(204).send();
  } catch (err) {
    console.error('Erro ao remover paciente:', err);
    return res.status(400).json({ error: 'Erro ao remover paciente', details: err.message });
  }
};


// POST /pacientes/com-usuario
// Cria paciente + usuário (papel PATIENT) amarrados
export const criarComUsuario = async (req, res) => {
  const papel = req.user?.papel;

  if (papel !== 'ADMIN' && papel !== 'RECEPTIONIST') {
    return res.status(403).json({
      error: 'Acesso negado. Somente ADMIN ou RECEPCIONISTA podem cadastrar pacientes com acesso.'
    });
  }

  const {
    nome,
    cpf,
    data_nascimento,
    telefone,
    email,
    endereco,
    consentimento_lgpd,
    senha
  } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({
      error: 'Nome, email e senha são obrigatórios para criar paciente com acesso ao sistema.'
    });
  }

  try {
    const resultado = await db.transaction(async (trx) => {
      // 1) Verificar se já existe usuário com este email
      const existenteUser = await trx('users').where({ email }).first();
      if (existenteUser) {
        const erro = new Error('EMAIL_JA_CADASTRADO');
        throw erro;
      }

      //Confirmar se o usuario com email já existe
       const existentePaciente = await trx('pacientes').where({ cpf_criptografado: cpf }).first();
      if (existentePaciente) {
        const erro = new Error('PACIENTE_JA_CADASTRADO');
        throw erro;
      }

      // 2) Criar usuário (papel PATIENT)
      const hash = await bcrypt.hash(senha, 10);

      const [user] = await trx('users')
        .insert({
          nome,
          email,
          senha: hash,
          papel: 'PATIENT',
          ativo: true
        })
        .returning(['id', 'nome', 'email', 'papel', 'ativo']);

      // 3) Criar paciente vinculado ao user_id
      const [paciente] = await trx('pacientes')
        .insert({
          nome,
          cpf_criptografado: cpf || null,
          data_nascimento: data_nascimento || null,
          telefone: telefone || null,
          email: email || null,
          endereco: endereco || null,
          consentimento_lgpd: !!consentimento_lgpd,
          user_id: user.id,
          ativo: true
        })
        .returning('*');

      return { user, paciente };
    });

    return res.status(201).json(resultado);
  } catch (err) {
    if (err.message === 'EMAIL_JA_CADASTRADO') {
      return res.status(400).json({ error: 'Já existe um usuário com este email.' });
    }

    console.error('Erro ao criar paciente com usuário:', err);
    return res.status(400).json({
      error: 'Erro ao criar paciente com usuário',
      details: err.message
    });
  }
};

// POST /pacientes/:id/criar-usuario
// Cria usuário (PATIENT) para um paciente que já existe
export const criarUsuarioParaPaciente = async (req, res) => {
  const papel = req.user?.papel;

  if (papel !== 'ADMIN' && papel !== 'RECEPTIONIST') {
    return res.status(403).json({
      error: 'Acesso negado. Somente ADMIN ou RECEPCIONISTA podem criar acesso para pacientes.'
    });
  }

  const { id } = req.params; // id do paciente
  const { email, senha } = req.body;

  if (!senha) {
    return res.status(400).json({
      error: 'Senha é obrigatória para criar usuário do paciente.'
    });
  }

  try {
    const resultado = await db.transaction(async (trx) => {
      // 1) Buscar paciente
      const paciente = await trx('pacientes').where({ id }).first();

      if (!paciente) {
        const erro = new Error('PACIENTE_NAO_ENCONTRADO');
        throw erro;
      }

      if (paciente.user_id) {
        const erro = new Error('JA_TEM_USUARIO');
        throw erro;
      }

      const emailFinal = email || paciente.email;

      if (!emailFinal) {
        const erro = new Error('EMAIL_OBRIGATORIO');
        throw erro;
      }

      // 2) Verificar se já existe usuário com este email
      const existenteUser = await trx('users').where({ email: emailFinal }).first();
      if (existenteUser) {
        const erro = new Error('EMAIL_JA_CADASTRADO');
        throw erro;
      }

      // 3) Criar usuário com papel PATIENT
      const hash = await bcrypt.hash(senha, 10);

      const [user] = await trx('users')
        .insert({
          nome: paciente.nome,
          email: emailFinal,
          senha: hash,
          papel: 'PATIENT',
          ativo: true
        })
        .returning(['id', 'nome', 'email', 'papel', 'ativo']);

      // 4) Atualizar paciente com user_id + email, se necessário
      const [pacienteAtualizado] = await trx('pacientes')
        .where({ id })
        .update(
          {
            user_id: user.id,
            email: emailFinal
          },
          '*'
        );

      return { user, paciente: pacienteAtualizado };
    });

    return res.status(201).json(resultado);
  } catch (err) {
    if (err.message === 'PACIENTE_NAO_ENCONTRADO') {
      return res.status(404).json({ error: 'Paciente não encontrado.' });
    }
    if (err.message === 'JA_TEM_USUARIO') {
      return res
        .status(400)
        .json({ error: 'Este paciente já possui um usuário vinculado.' });
    }
    if (err.message === 'EMAIL_OBRIGATORIO') {
      return res.status(400).json({
        error: 'Email é obrigatório (no body ou já cadastrado no paciente).'
      });
    }
    if (err.message === 'EMAIL_JA_CADASTRADO') {
      return res.status(400).json({ error: 'Já existe um usuário com este email.' });
    }

    console.error('Erro ao criar usuário para paciente:', err);
    return res.status(500).json({
      error: 'Erro ao criar usuário para paciente',
      details: err.message
    });
  }
};

// POST /pacientes/:id/anonimizar
// Anonimiza dados sensíveis de um paciente (LGPD - RNF02)
export const anonimizar = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const resultado = await db.transaction(async (trx) => {
      const paciente = await trx('pacientes').where({ id }).first();

      if (!paciente) {
        throw new Error('PACIENTE_NAO_ENCONTRADO');
      }

      if (paciente.anonimizado_em) {
        throw new Error('JA_ANONIMIZADO');
      }

      // FUNÇÕES DE MASCARAMENTO:
      const mask = (value) =>
        value ? value.replace(/.(?=.{2})/g, '*') : null;

      const maskEmail = (email) => {
        if (!email) return null;
        const [user, domain] = email.split('@');
        return (
          user[0] +
          '****@' +
          domain.replace(/.(?=.{3})/g, '*')
        );
      };

      const dadosMascarados = {
        nome_anterior: paciente.nome,
        nome_mascarado: mask(paciente.nome),
        email_anterior: paciente.email,
        email_mascarado: maskEmail(paciente.email),
        telefone_anterior: paciente.telefone,
        telefone_mascarado: mask(paciente.telefone),
        endereco_anterior: paciente.endereco,
        // nunca registrar CPF real em logs
        cpf_mascarado: paciente.cpf_criptografado ? '***CPF_REMOVIDO***' : null
      };

      // REGISTRA auditoria com dados mascarados
      await trx('audit_logs').insert({
        user_id: userId,
        acao: 'ANONIMIZACAO_PACIENTE',
        entidade: 'pacientes',
        entidade_id: id,
        detalhes: JSON.stringify(dadosMascarados),
        ip: req.ip || null,
        criado_em: trx.fn.now()
      });

      // AGORA sim, anonimiza o paciente no banco
      const [pacienteAnon] = await trx('pacientes')
        .where({ id })
        .update(
          {
            nome: 'PACIENTE_ANONIMIZADO',
            cpf_criptografado: null,
            data_nascimento: null,
            telefone: null,
            email: null,
            endereco: null,
            consentimento_lgpd: false,
            ativo: false,
            anonimizado_em: trx.fn.now(),
            anonimizado_por: userId,
            atualizado_em: trx.fn.now()
          },
          '*'
        );

      return pacienteAnon;
    });

    return res.json({
      message: 'Paciente anonimizado com sucesso (LGPD).',
      paciente: resultado
    });
  } catch (err) {
    if (err.message === 'PACIENTE_NAO_ENCONTRADO') {
      return res.status(404).json({ error: 'Paciente não encontrado.' });
    }

    if (err.message === 'JA_ANONIMIZADO') {
      return res
        .status(400)
        .json({ error: 'Este paciente já foi anonimizado anteriormente.' });
    }

    console.error('Erro ao anonimizar paciente:', err);
    return res.status(500).json({
      error: 'Erro ao anonimizar paciente.',
      details: err.message
    });
  }
};
