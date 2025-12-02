import db from '../config/database.js';
import { formatarDataHoraBR }  from '../utils/globalUtils.js';

const VISIBILIDADES_VALIDAS = ['PRIVADO', 'COMPARTILHADO'];
const STATUS_CONCLUIDO = 'CONCLUIDO';

// POST /prontuarios
// Cria um prontuário vinculado a um agendamento (RF05 + RN03)
export const criar = async (req, res) => {
  const userId = req.user?.id;
  const papel = req.user?.papel;

  if (papel !== 'PROFESSIONAL' && papel !== 'ADMIN') {
    return res.status(403).json({
      error: 'Apenas profissionais de saúde ou ADMIN podem registrar prontuários.'
    });
  }

  const {
    agendamento_id,
    tipo_registro,
    notas,
    prescricoes,
    anexos,
    visibilidade
  } = req.body;

  if (!agendamento_id) {
    return res.status(400).json({
      error: 'agendamento_id é obrigatório para criar um prontuário.'
    });
  }

  if (!notas && !prescricoes) {
    return res.status(400).json({
      error: 'Envie ao menos notas ou prescricoes para o prontuário.'
    });
  }

  if (visibilidade && !VISIBILIDADES_VALIDAS.includes(visibilidade)) {
    return res.status(400).json({
      error: `Visibilidade inválida. Valores aceitos: ${VISIBILIDADES_VALIDAS.join(', ')}`
    });
  }

  try {
    const resultado = await db.transaction(async (trx) => {
      // 1) Buscar agendamento
      const agendamento = await trx('agendamentos')
        .where({ id: agendamento_id })
        .first();

      if (!agendamento) {
        throw new Error('AGENDAMENTO_NAO_ENCONTRADO');
      }

      // RN03 — PROFESSIONAL só pode registrar se for o profissional do agendamento
      if (papel === 'PROFESSIONAL') {
        const profissional = await trx('profissionais')
          .where({ user_id: userId })
          .first();

        if (!profissional || profissional.id !== agendamento.profissional_id) {
          throw new Error('PROFISSIONAL_NAO_AUTORIZADO');
        }
      }

      // 2) Criar prontuário
      const [prontuario] = await trx('prontuarios')
        .insert(
          {
            agendamento_id,
            paciente_id: agendamento.paciente_id,
            profissional_id: agendamento.profissional_id,
            tipo_registro: tipo_registro || 'CONSULTA',
            notas: notas || null,
            prescricoes: prescricoes || null,
            anexos: anexos || null,
            visibilidade: visibilidade || 'PRIVADO',
            criado_por: userId,
            criado_em: trx.fn.now()
          },
          '*'
        );

      // Opcional: marcar agendamento como concluído
      await trx('agendamentos')
        .where({ id: agendamento_id })
        .update({
          status: STATUS_CONCLUIDO,
          atualizado_em: trx.fn.now()
        });

      // RF07 - registrar auditoria da criação
      await trx('audit_logs').insert({
        user_id: userId,
        acao: 'CRIACAO_PRONTUARIO',
        entidade: 'prontuarios',
        entidade_id: prontuario.id,
        detalhes: JSON.stringify({ agendamento_id, tipo_registro, visibilidade }),
        ip: req.ip || null,
        criado_em: trx.fn.now()
      });

      return prontuario;
    });

    return res.status(201).json(resultado);
  } catch (err) {
    if (err.message === 'AGENDAMENTO_NAO_ENCONTRADO') {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }
    if (err.message === 'PROFISSIONAL_NAO_AUTORIZADO') {
      return res.status(403).json({
        error: 'Você não está autorizado a registrar prontuário para este agendamento (RN03).'
      });
    }

    console.error('Erro ao criar prontuário:', err);
    return res.status(500).json({
      error: 'Erro ao criar prontuário.',
      details: err.message
    });
  }
};

// GET /prontuarios/:id
export const obterPorId = async (req, res) => {
  const { id } = req.params;
  const papel = req.user?.papel;
  const userId = req.user?.id;

  try {
    const prontuario = await db('prontuarios').where({ id }).first();

    if (!prontuario) {
      return res.status(404).json({ error: 'Prontuário não encontrado.' });
    }

    // ADMIN vê tudo
    if (papel === 'ADMIN') {
      return res.json(prontuario);
    }

    // PROFISSIONAL: precisa ser o dono do prontuário
    if (papel === 'PROFESSIONAL') {
      const profissional = await db('profissionais')
        .where({ user_id: userId })
        .first();

      if (!profissional || profissional.id !== prontuario.profissional_id) {
        return res.status(403).json({
          error: 'Você não tem permissão para visualizar este prontuário.'
        });
      }

      return res.json(prontuario);
    }

    // PACIENTE: precisa ser o paciente + visibilidade COMPARTILHADO
    if (papel === 'PATIENT') {
      const paciente = await db('pacientes').where({ user_id: userId }).first();

      if (
        !paciente ||
        paciente.id !== prontuario.paciente_id ||
        prontuario.visibilidade !== 'COMPARTILHADO'
      ) {
        return res.status(403).json({
          error: 'Você não tem permissão para visualizar este prontuário.'
        });
      }

      return res.json(prontuario);
    }

    // Outros papéis não visualizam
    return res.status(403).json({
      error: 'Você não tem permissão para visualizar este prontuário.'
    });
  } catch (err) {
    console.error('Erro ao buscar prontuário:', err);
    return res.status(500).json({
      error: 'Erro ao buscar prontuário.',
      details: err.message
    });
  }
};

// GET /prontuarios/paciente/:pacienteId
export const listarPorPaciente = async (req, res) => {
  const { pacienteId } = req.params;
  const papel = req.user?.papel;
  const userId = req.user?.id;

  try {
    // PACIENTE: só vê prontuários dele e COMPARTILHADO
    if (papel === 'PATIENT') {
      const paciente = await db('pacientes').where({ user_id: userId }).first();

      if (!paciente || String(paciente.id) !== String(pacienteId)) {
        return res.status(403).json({
          error: 'Você só pode visualizar seus próprios prontuários.'
        });
      }

      const prontuarios = await db('prontuarios')
        .where({ paciente_id: pacienteId, visibilidade: 'COMPARTILHADO' })
        .orderBy('criado_em', 'desc');

      return res.json(prontuarios);
    }

    // PROFISSIONAL: vê prontuários do paciente que ele mesmo atendeu
    if (papel === 'PROFESSIONAL') {
      const profissional = await db('profissionais')
        .where({ user_id: userId })
        .first();

      if (!profissional) {
        return res.status(403).json({
          error: 'Profissional não encontrado ou não autorizado.'
        });
      }

      const prontuarios = await db('prontuarios')
        .where({ paciente_id: pacienteId, profissional_id: profissional.id })
        .orderBy('criado_em', 'desc');

      return res.json(prontuarios);
    }

    // ADMIN: vê tudo
    if (papel === 'ADMIN') {
      const prontuarios = await db('prontuarios')
        .where({ paciente_id: pacienteId })
        .orderBy('criado_em', 'desc');

      return res.json(prontuarios);
    }

    return res.status(403).json({
      error: 'Você não tem permissão para visualizar prontuários deste paciente.'
    });
  } catch (err) {
    console.error('Erro ao listar prontuários por paciente:', err);
    return res.status(500).json({
      error: 'Erro ao listar prontuários por paciente.',
      details: err.message
    });
  }
};

// PATCH /prontuarios/:id
// Atualizar parcialmente prontuário (sem apagar histórico, só complementando)
export const atualizar = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const papel = req.user?.papel;

  const { notas, prescricoes, anexos, visibilidade } = req.body;

  if (!notas && !prescricoes && !anexos && !visibilidade) {
    return res.status(400).json({
      error: 'Envie ao menos um campo para alterar.'
    });
  }

  if (visibilidade && !VISIBILIDADES_VALIDAS.includes(visibilidade)) {
    return res.status(400).json({
      error: `Visibilidade inválida. Tipos aceitos: ${VISIBILIDADES_VALIDAS.join(', ')}`
    });
  }

  try {
    const atualizado = await db.transaction(async (trx) => {
      const prontuario = await trx('prontuarios').where({ id }).first();

      if (!prontuario) {
        throw new Error('PRONTUARIO_NAO_ENCONTRADO');
      }

      // RN03 — PROFESSIONAL só edita prontuário que é dele
      if (papel === 'PROFESSIONAL') {
        const profissional = await trx('profissionais')
          .where({ user_id: userId })
          .first();

        if (!profissional || profissional.id !== prontuario.profissional_id) {
          throw new Error('PROFISSIONAL_NAO_AUTORIZADO');
        }
      }

      // ADMIN pode editar qualquer prontuário
      const updateData = {
        atualizado_em: trx.fn.now()
      };

      if (notas !== undefined) updateData.notas = notas;
      if (prescricoes !== undefined) updateData.prescricoes = prescricoes;
      if (anexos !== undefined) updateData.anexos = anexos;
      if (visibilidade !== undefined) updateData.visibilidade = visibilidade;

      const [novo] = await trx('prontuarios')
        .where({ id })
        .update(updateData, '*');

      // RF07 — auditoria da alteração
      await trx('audit_logs').insert({
        user_id: userId,
        acao: 'ALTERACAO_PRONTUARIO',
        entidade: 'prontuarios',
        entidade_id: id,
        detalhes: JSON.stringify(req.body),
        ip: req.ip || null,
        criado_em: trx.fn.now()
      });

      return novo;
    });

    return res.json({
      message: 'Prontuário atualizado com sucesso.',
      prontuario: atualizado
    });
  } catch (err) {
    if (err.message === 'PRONTUARIO_NAO_ENCONTRADO') {
      return res.status(404).json({ error: 'Prontuário não encontrado.' });
    }

    if (err.message === 'PROFISSIONAL_NAO_AUTORIZADO') {
      return res.status(403).json({
        error: 'Você não está autorizado a alterar este prontuário.'
      });
    }

    console.error('Erro ao atualizar prontuário:', err);
    return res.status(500).json({
      error: 'Erro ao atualizar prontuário.',
      details: err.message
    });
  }
};

// GET /prontuarios/:id/receita
export const emitirReceita = async (req, res) => {
  const { id } = req.params;
  const papel = req.user?.papel;
  const userId = req.user?.id;

  try {
    // 1) Buscar prontuário
    const prontuario = await db('prontuarios').where({ id }).first();

    if (!prontuario) {
      return res.status(404).json({ error: 'Prontuário não encontrado.' });
    }

    // 2) Regras de acesso (igual obterPorId)
    if (papel === 'ADMIN') {
      // ok
    } else if (papel === 'PROFESSIONAL') {
      const profissional = await db('profissionais')
        .where({ user_id: userId })
        .first();

      if (!profissional || profissional.id !== prontuario.profissional_id) {
        return res.status(403).json({
          error: 'Você não tem permissão para emitir receita deste prontuário.'
        });
      }
    } else if (papel === 'PATIENT') {
      const paciente = await db('pacientes').where({ user_id: userId }).first();

      if (
        !paciente ||
        paciente.id !== prontuario.paciente_id ||
        prontuario.visibilidade !== 'COMPARTILHADO'
      ) {
        return res.status(403).json({
          error: 'Você não tem permissão para visualizar esta receita.'
        });
      }
    } else {
      // RECEPTIONIST ou outros não acessam receita
      return res.status(403).json({
        error: 'Você não tem permissão para visualizar esta receita.'
      });
    }

    if (!prontuario.prescricoes) {
      return res.status(400).json({
        error: 'Este prontuário não possui prescrições associadas.'
      });
    }

    // 3) Buscar dados do paciente e profissional para enriquecer a receita
    const paciente = await db('pacientes')
      .where({ id: prontuario.paciente_id })
      .first();

    const profissional = await db('profissionais')
      .where({ id: prontuario.profissional_id })
      .first();

    const receita = {
      prontuario_id: prontuario.id,
      paciente: paciente
        ? {
            id: paciente.id,
            nome: paciente.nome,
            data_nascimento: paciente.data_nascimento
          }
        : null,
      profissional: profissional
        ? {
            id: profissional.id,
            nome: profissional.nome,
            crm: profissional.crm,
            especialidade: profissional.especialidade
          }
        : null,
      data_emissao: formatarDataHoraBR(prontuario.criado_em),
      tipo_registro: prontuario.tipo_registro,
      prescricoes: prontuario.prescricoes,
      notas: prontuario.notas
    };

    return res.json(receita);
  } catch (err) {
    console.error('Erro ao emitir receita digital:', err);
    return res.status(500).json({
      error: 'Erro ao emitir receita digital.',
      details: err.message
    });
  }
};

