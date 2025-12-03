import db from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3600'; // segundos
const REFRESH_TOKEN_DAYS = process.env.REFRESH_TOKEN_DAYS || '30';

const PAPÉIS_VALIDOS = ['ADMIN', 'RECEPTIONIST', 'PROFESSIONAL', 'PATIENT'];

export const register = async (req, res) => {
  const { nome, email, senha, papel } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }

  // papel padrão: RECEPTIONIST, mas jamais aceitar ADMIN vindo direto do body
  let papelFinal = papel || 'RECEPTIONIST';

  if (!PAPÉIS_VALIDOS.includes(papelFinal)) {
    return res.status(400).json({ error: 'Papel inválido' });
  }

  if (papelFinal === 'ADMIN') {
    // opcional: bloquear criação de ADMIN via register
    return res
      .status(403)
      .json({ error: 'Criação de usuário ADMIN só pode ser feita internamente.' });
  }

  try {
    const existente = await db('users').where({ email }).first();
    if (existente) {
      return res.status(400).json({ error: 'Já existe um usuário com este email' });
    }

    const hash = await bcrypt.hash(senha, 10);

    const [user] = await db('users')
      .insert({
        nome,
        email,
        senha: hash,
        papel: papelFinal,
        ativo: true
      })
      .returning(['id', 'nome', 'email', 'papel', 'ativo']);

    return res.status(201).json(user);
  } catch (err) {
    console.error('Erro ao registrar usuário:', err);
    return res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

export const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const user = await db('users').where({ email }).first();

    if (!user) {
      // log de tentativa falha (sem user_id)
      await db('audit_logs').insert({
        user_id: null,
        acao: 'LOGIN_FALHA',
        entidade: 'users',
        entidade_id: null,
        detalhes: JSON.stringify({
          email_tentado: email,
          motivo: 'USUARIO_NAO_ENCONTRADO'
        }),
        ip: req.ip || null,
        criado_em: db.fn.now()
      });

      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (!user.ativo) {
      // log de tentativa falha por usuário inativo
      await db('audit_logs').insert({
        user_id: user.id,
        acao: 'LOGIN_FALHA',
        entidade: 'users',
        entidade_id: user.id,
        detalhes: JSON.stringify({
          email_tentado: email,
          motivo: 'USUARIO_INATIVO'
        }),
        ip: req.ip || null,
        criado_em: db.fn.now()
      });

      return res.status(403).json({ error: 'Usuário inativo' });
    }

    const senhaOk = await bcrypt.compare(senha, user.senha);
    if (!senhaOk) {
      // log de tentativa falha por senha incorreta
      await db('audit_logs').insert({
        user_id: user.id,
        acao: 'LOGIN_FALHA',
        entidade: 'users',
        entidade_id: user.id,
        detalhes: JSON.stringify({
          email_tentado: email,
          motivo: 'SENHA_INCORRETA'
        }),
        ip: req.ip || null,
        criado_em: db.fn.now()
      });

      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      papel: user.papel
    };

    // access token (curto prazo)
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: Number(JWT_EXPIRES_IN) // em segundos
    });

    // refresh token (longo prazo)
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: `${REFRESH_TOKEN_DAYS}d` }
    );

    // revogar tokens antigos do usuário (opcional, mas recomendado)
    await db('refresh_tokens')
      .where({ user_id: user.id, revogado: false })
      .update({ revogado: true });

    // salvar novo refresh token no banco
    await db('refresh_tokens').insert({
      user_id: user.id,
      token: refreshToken,
      expira_em: db.raw(`NOW() + INTERVAL '${REFRESH_TOKEN_DAYS} days'`),
      revogado: false,
      criado_em: db.fn.now()
    });

    // log de login bem-sucedido
    await db('audit_logs').insert({
      user_id: user.id,
      acao: 'LOGIN_SUCESSO',
      entidade: 'users',
      entidade_id: user.id,
      detalhes: JSON.stringify({
        email: user.email,
        papel: user.papel
      }),
      ip: req.ip || null,
      criado_em: db.fn.now()
    });

    return res.json({
      token,
      refresh_token: refreshToken,
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        papel: user.papel
      }
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ error: 'Erro no login' });
  }
};

/**
 * Endpoint para renovar o access token usando o refresh token
 * POST /auth/refresh
 * body: { refresh_token }
 */
export const refreshToken = async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token é obrigatório' });
  }

  try {
    // verifica se o token existe no banco e não foi revogado
    const tokenDB = await db('refresh_tokens')
      .where({ token: refresh_token, revogado: false })
      .first();

    if (!tokenDB) {
      return res.status(401).json({ error: 'Refresh token inválido ou revogado' });
    }

    let payload;
    try {
      payload = jwt.verify(refresh_token, JWT_SECRET);
    } catch (err) {
      // opcional: marcar como revogado se expirou
      await db('refresh_tokens')
        .where({ token: refresh_token })
        .update({ revogado: true });

      return res.status(401).json({ error: 'Refresh token expirado' });
    }

    // garantir que o user existe e está ativo
    const user = await db('users')
      .where({ id: tokenDB.user_id })
      .first();

    if (!user || !user.ativo) {
      return res.status(401).json({ error: 'Usuário inválido ou inativo' });
    }

    const newPayload = {
      id: user.id,
      email: user.email,
      papel: user.papel
    };

    const newToken = jwt.sign(newPayload, JWT_SECRET, {
      expiresIn: Number(JWT_EXPIRES_IN)
    });

    // (opcional) logar sucesso de refresh
    await db('audit_logs').insert({
      user_id: user.id,
      acao: 'REFRESH_TOKEN_SUCESSO',
      entidade: 'users',
      entidade_id: user.id,
      detalhes: JSON.stringify({
        motivo: 'RENOVACAO_TOKEN',
        refresh_token_id: tokenDB.id
      }),
      ip: req.ip || null,
      criado_em: db.fn.now()
    });

    return res.json({
      token: newToken
    });
  } catch (err) {
    console.error('Erro ao renovar token:', err);
    return res.status(500).json({ error: 'Erro ao renovar token' });
  }
};
