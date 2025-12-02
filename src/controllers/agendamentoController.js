import db from '../config/database.js';
import { convertDateBRToISO } from '../utils/globalUtils.js';

const STATUS_AGENDADO = 'AGENDADO';
const STATUS_CANCELADO = 'CANCELADO';
const STATUS_CONCLUIDO = 'CONCLUIDO';

const tiposConsulta = ['CONSULTA', 'RETORNO', 'EXAME', 'TERAPIA', 'PROCEDIMENTO'];

// GET /agendamentos
// Filtros opcionais: ?profissional_id=&paciente_id=&status=&data_inicio=&data_fim=
export const listar = async (req, res) => {
  const { profissional_id, paciente_id, status, data_inicio, data_fim } = req.query;

  try {
    const query = db('agendamentos').select('*');

    if (profissional_id) query.where('profissional_id', profissional_id);
    if (paciente_id) query.where('paciente_id', paciente_id);
    if (status) query.where('status', status);

    if (data_inicio) query.where('data_horario', '>=', data_inicio);
    if (data_fim) query.where('data_horario', '<=', data_fim);

    const resultado = await query.orderBy('data_horario', 'asc');

    return res.json(resultado);
  } catch (err) {
    console.error('Erro ao listar agendamentos:', err);
    return res.status(500).json({ error: 'Erro ao listar agendamentos.' });
  }
};

// GET /agendamentos/:id
export const obterPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const agendamento = await db('agendamentos').where({ id }).first();

    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }

    return res.json(agendamento);
  } catch (err) {
    console.error('Erro ao buscar agendamento:', err);
    return res.status(500).json({ error: 'Erro ao buscar agendamento.' });
  }
};

// POST /agendamentos
// RF04 + RN01 (não permitir conflito de horário para o mesmo profissional)
export const criar = async (req, res) => {

  const {
    paciente_id,
    profissional_id,
    data_horario,     // pode vir em BR: "01/12/2025 14:00:00" ou ISO
    duracao_minutos,
    tipo,             // campo conceitual, se quiser pode ignorar na tabela
    observacoes
  } = req.body;

  const usuarioLogado = req.user?.id || null; // criado_por

  if(tipo && !tiposConsuilta.includes(tipo)) {
    return res.status(400).json({ error: `Tipo de consulta inválido. Tipos aceitos: ${tiposConsuilta.join(', ')}` });
  }

  // 1) Validar campos obrigatórios
  if (!paciente_id || !profissional_id || !data_horario) {
    return res.status(400).json({
      error: 'Campos obrigatórios: paciente_id, profissional_id, data_horario.'
    });
  }

  // 2) Converter data_horario (BR -> ISO, se necessário)
  let dataISO = data_horario;

  // Se vier no formato brasileiro (tem "/"), converte
  if (data_horario.includes('/')) {
    dataISO = convertDateBRToISO(data_horario);
  }

  const data = new Date(dataISO);
  if (isNaN(data.getTime())) {
    return res.status(400).json({
      error:
        'data_horario inválida. Formatos aceitos: "DD/MM/YYYY HH:mm:ss" ou ISO 8601 (ex: 2025-12-01T14:00:00).'
    });
  }

  try {
    const resultado = await db.transaction(async (trx) => {
      // 3) Validar paciente ativo
      const paciente = await trx('pacientes')
        .where({ id: paciente_id, ativo: true })
        .first();

      if (!paciente) {
        throw new Error('PACIENTE_INVALIDO');
      }

      // 4) Validar profissional ativo
      const profissional = await trx('profissionais')
        .where({ id: profissional_id, ativo: true })
        .first();

      if (!profissional) {
        throw new Error('PROFISSIONAL_INVALIDO');
      }

      // 5) RN01 — Verificar conflito de horário
      const conflito = await trx('agendamentos')
        .where({
          profissional_id,
          data_horario: dataISO
        })
        .whereNot({ status: STATUS_CANCELADO })
        .first();

      if (conflito) {
        throw new Error('CONFLITO_HORARIO');
      }

      // 6) Criar agendamento
      const [novo] = await trx('agendamentos')
        .insert({
          paciente_id,
          profissional_id,
          data_horario: dataISO,
          duracao_minutos: duracao_minutos || 30,
          status: STATUS_AGENDADO,
          criado_por: usuarioLogado,
          tipo: tipo,
          observacoes: observacoes || null,
          criado_em: trx.fn.now(),
          atualizado_em: trx.fn.now()
        })
        .returning('*');

      return novo;
    });

    return res.status(201).json(resultado);
  } catch (err) {
    if (err.message === 'PACIENTE_INVALIDO') {
      return res.status(400).json({ error: 'Paciente inválido ou inativo.' });
    }
    if (err.message === 'PROFISSIONAL_INVALIDO') {
      return res.status(400).json({ error: 'Profissional inválido ou inativo.' });
    }
    if (err.message === 'CONFLITO_HORARIO') {
      return res.status(400).json({
        error:
          'Conflito de horário: já existe um agendamento para este profissional neste horário (RN01).'
      });
    }

    console.error('Erro ao criar agendamento:', err);
    return res.status(500).json({
      error: 'Erro ao criar agendamento.',
      details: err.message
    });
  }
};

// PATCH /agendamentos/:id/cancelar
export const cancelar = async (req, res) => {
  const { id } = req.params;

  try {
    const [agendamento] = await db('agendamentos')
      .where({ id })
      .update(
        {
          status: STATUS_CANCELADO,
          atualizado_em: db.fn.now()
        },
        '*'
      );

    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }

     // log de auditoria do cancelamento RF07
      await trx('audit_logs').insert({
        user_id: userId || null,
        acao: 'CANCELAMENTO_AGENDAMENTO',
        entidade: 'agendamentos',
        entidade_id: id,
        detalhes: JSON.stringify({
          status_anterior: agendamento.status,
          status_novo: novo.status,
          data_horario: agendamento.data_horario,
          motivo_cancelamento: motivo_cancelamento || null
        }),
        ip: req.ip || null,
        criado_em: trx.fn.now()
      });

    return res.json({
      message: 'Agendamento cancelado com sucesso.',
      agendamento
    });
  } catch (err) {
    console.error('Erro ao cancelar agendamento:', err);
    return res.status(500).json({
      error: 'Erro ao cancelar agendamento.',
      details: err.message
    });
  }
};

// PATCH /agendamentos/:id/reagendar
export const reagendar = async (req, res) => {
  const { id } = req.params;
  const { data_horario, duracao_minutos, tipo, observacoes } = req.body;

  if (!data_horario) {
    return res.status(400).json({
      error: 'data_horario é obrigatório para reagendar.'
    });
  }

  // valida tipo, se enviado
  if (tipo && !tiposConsulta.includes(tipo)) {
    return res.status(400).json({
      error: `Tipo de consulta inválido. Tipos aceitos: ${tiposConsulta.join(', ')}`
    });
  }

  // converte data BR → ISO se necessário
  let dataISO = data_horario;
  if (data_horario.includes('/')) {
    dataISO = convertDateBRToISO(data_horario);
  }

  const data = new Date(dataISO);
  if (isNaN(data.getTime())) {
    return res.status(400).json({
      error:
        'data_horario inválida. Formatos aceitos: "DD/MM/YYYY HH:mm:ss" ou ISO 8601.'
    });
  }

  try {
    const atualizado = await db.transaction(async (trx) => {
      // 1) Buscar agendamento existente
      const agendamento = await trx('agendamentos').where({ id }).first();

      if (!agendamento) {
        const erro = new Error('NAO_ENCONTRADO');
        throw erro;
      }

      if (agendamento.status === STATUS_CANCELADO) {
        const erro = new Error('CANCELADO');
        throw erro;
      }

      // 2) RN01 — verificar conflito no novo horário
      const conflito = await trx('agendamentos')
        .where({
          profissional_id: agendamento.profissional_id,
          data_horario: dataISO
        })
        .whereNot({ status: STATUS_CANCELADO })
        .whereNot({ id }) // ignora o próprio agendamento
        .first();

      if (conflito) {
        const erro = new Error('CONFLITO_HORARIO');
        throw erro;
      }

      // 3) Montar dados para update (parcial)
      const updateData = {
        data_horario: dataISO,
        atualizado_em: trx.fn.now()
      };

      if (duracao_minutos) {
        updateData.duracao_minutos = duracao_minutos;
      }

      if (tipo) {
        updateData.tipo = tipo;
      }

      if (observacoes !== undefined) {
        updateData.observacoes = observacoes;
      }

      const [novoAgendamento] = await trx('agendamentos')
        .where({ id })
        .update(updateData, '*');

      return novoAgendamento;
    });

    return res.json({
      message: 'Agendamento reagendado com sucesso.',
      agendamento: atualizado
    });
  } catch (err) {
    if (err.message === 'NAO_ENCONTRADO') {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }
    if (err.message === 'CANCELADO') {
      return res
        .status(400)
        .json({ error: 'Não é possível reagendar um agendamento cancelado.' });
    }
    if (err.message === 'CONFLITO_HORARIO') {
      return res.status(400).json({
        error:
          'Conflito de horário: já existe um agendamento para este profissional neste horário (RN01).'
      });
    }

    console.error('Erro ao reagendar agendamento:', err);
    return res.status(500).json({
      error: 'Erro ao reagendar agendamento.',
      details: err.message
    });
  }
};

