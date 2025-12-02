// src/controllers/profissionalController.js
import db from '../config/database.js';
import bcrypt from 'bcrypt';

// GET /profissionais
export const listar = async (req, res) => {
  try {
    const profissionais = await db('profissionais')
      .where({ ativo: true })
      .select('id', 'nome', 'crm', 'especialidade', 'telefone', 'email')
       .orderBy('id', 'asc');

    return res.json(profissionais);
  } catch (err) {
    console.error('Erro ao listar profissionais:', err);
    return res.status(500).json({ error: 'Erro ao listar profissionais' });
  }
};

// GET /profissionais/:id
export const obterPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const profissional = await db('profissionais')
      .where({ id, ativo: true })
      .first();

    if (!profissional) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    return res.json(profissional);
  } catch (err) {
    console.error('Erro ao buscar profissional:', err);
    return res.status(500).json({ error: 'Erro ao buscar profissional' });
  }
};

// POST /profissionais  (sem vínculo com user ainda)
export const criar = async (req, res) => {
  const { nome, crm, especialidade, telefone, email } = req.body;

 
  if (!nome || !crm || !especialidade || !telefone || !email) {
    return res.status(400).json({
      error:
        'Todos os campos são obrigatórios: nome, crm, especialidade, telefone, email'
    });
  }

  // ------------------------------
  // 1. Validar CRM (formato CRM-12345)
  // ------------------------------
  const crmRegex = /^CRM-\d{5}$/i;
  if (!crmRegex.test(crm)) {
    return res.status(400).json({
      error: 'CRM inválido. Formato esperado: CRM-12345'
    });
  }

  // ------------------------------
  //  2. Validar email
  // ------------------------------
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Email inválido. Informe um email válido.'
    });
  }

  // ------------------------------
  //  3. Validar telefone (somente números)
  // ------------------------------
  const telLimpo = telefone.replace(/\D/g, '');
  if (telLimpo.length < 10 || telLimpo.length > 11) {
    return res.status(400).json({
      error:
        'Telefone inválido. Informe apenas números (DDD + número). Ex: 11999998888'
    });
  }

  try {
    // ------------------------------
    //  4. Verificar se CRM já existe
    // ------------------------------
    const crmExiste = await db('profissionais')
      .where({ crm })
      .first();

    if (crmExiste) {
      return res
        .status(400)
        .json({ error: 'CRM já cadastrado no sistema.' });
    }

    // ------------------------------
    //  5. Verificar se email já existe
    // ------------------------------
    const emailExiste = await db('profissionais')
      .where({ email })
      .first();

    if (emailExiste) {
      return res
        .status(400)
        .json({ error: 'Email já cadastrado para outro profissional.' });
    }

    // ------------------------------
    //  6. Inserir profissional
    // ------------------------------
    const [novo] = await db('profissionais')
      .insert({
        nome,
        crm: crm.toUpperCase(),
        especialidade,
        telefone: telLimpo,
        email: email.toLowerCase(),
        user_id: null,
        ativo: true
      })
      .returning('*');

    return res.status(201).json(novo);
  } catch (err) {
    console.error('Erro ao criar profissional:', err);
    return res.status(400).json({
      error: 'Erro ao criar profissional',
      details: err.message
    });
  }
};


// PUT /profissionais/:id
export const atualizar = async (req, res) => {
  const { id } = req.params;
  const { nome, crm, especialidade, telefone, email } = req.body;

  try {
    // -----------------------------
    // 1. Verificar se profissional existe
    // -----------------------------
    const profissionalExistente = await db('profissionais')
      .where({ id, ativo: true })
      .first();

    if (!profissionalExistente) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    // -----------------------------
    // 2. Criar objeto dinâmico
    // -----------------------------
    const camposParaAtualizar = {};

    if (nome) camposParaAtualizar.nome = nome;

    if (crm) {
      const crmRegex = /^CRM-\d{5}$/i;
      if (!crmRegex.test(crm)) {
        return res.status(400).json({ error: 'CRM inválido. Use o formato CRM-12345' });
      }

      // verificar duplicidade
      const crmExiste = await db('profissionais')
        .where({ crm })
        .whereNot({ id })
        .first();

      if (crmExiste) {
        return res.status(400).json({ error: 'CRM já está em uso por outro profissional.' });
      }

      camposParaAtualizar.crm = crm.toUpperCase();
    }

    if (especialidade) camposParaAtualizar.especialidade = especialidade;

    if (telefone) {
      const telLimpo = telefone.replace(/\D/g, '');
      if (telLimpo.length < 10 || telLimpo.length > 11) {
        return res.status(400).json({
          error: 'Telefone inválido. Use apenas números com DDD. Ex: 11988887777'
        });
      }
      camposParaAtualizar.telefone = telLimpo;
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email inválido.' });
      }

      const emailExiste = await db('profissionais')
        .where({ email })
        .whereNot({ id })
        .first();

      if (emailExiste) {
        return res.status(400).json({ error: 'Email já está sendo usado por outro profissional.' });
      }

      camposParaAtualizar.email = email.toLowerCase();
    }

    // -----------------------------
    // 3. Caso nenhum campo tenha sido enviado
    // -----------------------------
    if (Object.keys(camposParaAtualizar).length === 0) {
      return res.status(400).json({
        error: 'Nenhum campo válido foi enviado para atualização.'
      });
    }

    // -----------------------------
    // 4. Executar update
    // -----------------------------
    const [atualizado] = await db('profissionais')
      .where({ id })
      .update(camposParaAtualizar, '*');

    return res.json(atualizado);

  } catch (err) {
    console.error('Erro ao atualizar profissional:', err);
    return res.status(500).json({
      error: 'Erro ao atualizar profissional',
      details: err.message
    });
  }
};


// DELETE /profissionais/:id (soft delete)
export const remover = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await db.transaction(async (trx) => {
      // 1 ▬▬▬ Buscar profissional
      const profissional = await trx('profissionais')
        .where({ id, ativo: true })
        .first();

      if (!profissional) {
        const erro = new Error('PROFISSIONAL_NAO_ENCONTRADO');
        throw erro;
      }

      // 2 ▬▬▬ Desativar profissional
      await trx('profissionais')
        .where({ id })
        .update({ ativo: false });

      // 3 ▬▬▬ Se tiver user vinculado, desativar também
      if (profissional.user_id) {
        await trx('users')
          .where({ id: profissional.user_id })
          .update({ ativo: false });
      }

      return { profissionalDesativado: true };
    });

    return res.status(204).send(); // Sem conteúdo, mas sucesso

  } catch (err) {
    if (err.message === 'PROFISSIONAL_NAO_ENCONTRADO') {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    console.error('Erro ao remover profissional:', err);
    return res
      .status(500)
      .json({ error: 'Erro ao remover profissional', details: err.message });
  }
};

// PATCH /profissionais/:id/reativar
export const reativar = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await db.transaction(async (trx) => {
      // 1 ▬▬▬ Buscar profissional (mesmo que esteja inativo)
      const profissional = await trx('profissionais')
        .where({ id })
        .first();

      if (!profissional) {
        const erro = new Error('PROFISSIONAL_NAO_ENCONTRADO');
        throw erro;
      }

      if (profissional.ativo) {
        const erro = new Error('JA_ATIVO');
        throw erro;
      }

      // 2 ▬▬▬ Reativar profissional
      const [profAtualizado] = await trx('profissionais')
        .where({ id })
        .update({ ativo: true }, '*');

      // 3 ▬▬▬ Se tiver user vinculado, reativar também
      if (profissional.user_id) {
        await trx('users')
          .where({ id: profissional.user_id })
          .update({ ativo: true });
      }

      return profAtualizado;
    });

    return res.json({
      message: 'Profissional reativado com sucesso.',
      profissional: resultado
    });

  } catch (err) {
    if (err.message === 'PROFISSIONAL_NAO_ENCONTRADO') {
      return res.status(404).json({ error: 'Profissional não encontrado.' });
    }
    if (err.message === 'JA_ATIVO') {
      return res.status(400).json({ error: 'Profissional já está ativo.' });
    }

    console.error('Erro ao reativar profissional:', err);
    return res
      .status(500)
      .json({ error: 'Erro ao reativar profissional.', details: err.message });
  }
};




// POST /profissionais/:id/criar-usuario
// Cria um usuário (users) para um profissional que já existe
export const criarUsuarioParaProfissional = async (req, res) => {
  const { id } = req.params; // id do profissional
  const { email, senha } = req.body;

  if (!senha) {
    return res.status(400).json({ error: 'Senha é obrigatória para criar o usuário.' });
  }

  try {
    const resultado = await db.transaction(async (trx) => {
      // 1. Buscar profissional
      const profissional = await trx('profissionais').where({ id }).first();

      if (!profissional) {
        const erro = new Error('PROFISSIONAL_NAO_ENCONTRADO');
        throw erro;
      }

      if (profissional.user_id) {
        const erro = new Error('JA_TEM_USUARIO');
        throw erro;
      }

      const emailFinal = email || profissional.email;

      if (!emailFinal) {
        const erro = new Error('EMAIL_OBRIGATORIO');
        throw erro;
      }

      // 2. Verificar se já existe user com esse email
      const existente = await trx('users').where({ email: emailFinal }).first();
      if (existente) {
        const erro = new Error('EMAIL_JA_CADASTRADO');
        throw erro;
      }

      // 3. Criar usuário
      const senhaHash = await bcrypt.hash(senha, 10);

      const [user] = await trx('users')
        .insert({
          nome: profissional.nome,
          email: emailFinal,
          senha: senhaHash,
          papel: 'PROFESSIONAL',
          ativo: true,
          criado_em: trx.fn.now(),
          atualizado_em: trx.fn.now()
        })
        .returning(['id', 'nome', 'email', 'papel', 'ativo']);

      // 4. Atualizar profissional com user_id
      const [profAtualizado] = await trx('profissionais')
        .where({ id })
        .update(
          {
            user_id: user.id,
            email: emailFinal
          },
          '*'
        );

      return { user, profissional: profAtualizado };
    });

    return res.status(201).json(resultado);
  } catch (err) {
    if (err.message === 'PROFISSIONAL_NAO_ENCONTRADO') {
      return res.status(404).json({ error: 'Profissional não encontrado.' });
    }
    if (err.message === 'JA_TEM_USUARIO') {
      return res
        .status(400)
        .json({ error: 'Este profissional já possui um usuário vinculado.' });
    }
    if (err.message === 'EMAIL_OBRIGATORIO') {
      return res
        .status(400)
        .json({ error: 'Email é obrigatório (no body ou cadastrado no profissional).' });
    }
    if (err.message === 'EMAIL_JA_CADASTRADO') {
      return res.status(400).json({ error: 'Já existe um usuário com este email.' });
    }

    console.error('Erro ao criar usuário para profissional:', err);
    return res
      .status(500)
      .json({ error: 'Erro ao criar usuário para profissional.', details: err.message });
  }
};



// POST /profissionais/com-usuario
// Cria usuário (users) + profissional (profissionais) amarrados por user_id
export const criarComUsuario = async (req, res) => {
  const {
    nome,
    email,
    senha,
    crm,
    especialidade,
    telefone
  } = req.body;

  if (!nome || !email || !senha) {
    return res
      .status(400)
      .json({ error: 'Nome, email e senha são obrigatórios para criar o usuário do profissional.' });
  }

  try {
    const resultado = await db.transaction(async (trx) => {
      // Verifica se já existe usuário com esse email
      const existente = await trx('users').where({ email }).first();
      if (existente) {
        const erro = new Error('EMAIL_JA_CADASTRADO');
        throw erro;
      }

      // Cria usuário com papel PROFESSIONAL
      const senhaHash = await bcrypt.hash(senha, 10);

      const [user] = await trx('users')
        .insert({
          nome,
          email,
          senha: senhaHash,
          papel: 'PROFESSIONAL',
          ativo: true,
          criado_em: trx.fn.now(),
          atualizado_em: trx.fn.now()
        })
        .returning(['id', 'nome', 'email', 'papel', 'ativo']);

      // Cria profissional referenciando o user_id
      const [profissional] = await trx('profissionais')
        .insert({
          nome,
          crm: crm || null,
          especialidade: especialidade || null,
          telefone: telefone || null,
          email: email || null,
          user_id: user.id,
          ativo: true,
          criado_em: trx.fn.now()
        })
        .returning('*');

      return { user, profissional };
    });

    return res.status(201).json(resultado);
  } catch (err) {
    if (err.message === 'EMAIL_JA_CADASTRADO') {
      return res.status(400).json({ error: 'Já existe um usuário com este email.' });
    }

    console.error('Erro ao criar profissional com usuário:', err);
    return res
      .status(500)
      .json({ error: 'Erro ao criar profissional com usuário.', details: err.message });
  }
};
