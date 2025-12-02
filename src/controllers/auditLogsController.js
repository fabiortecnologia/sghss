import db from '../config/database.js';

export const listarAuditLogs = async (req, res) => {
  try {
    let {
      pagina = 1,
      limite = 20,
      acao,
      entidade,
      user_id,
      dataInicio,
      dataFim
    } = req.query;

    pagina = Number(pagina) || 1;
    limite = Number(limite) || 20;

    const baseQuery = db('audit_logs').clone();

    // filtros
    if (acao) baseQuery.where('acao', acao);
    if (entidade) baseQuery.where('entidade', entidade);
    if (user_id) baseQuery.where('user_id', user_id);

    if (dataInicio) baseQuery.where('criado_em', '>=', dataInicio);
    if (dataFim) baseQuery.where('criado_em', '<=', dataFim);

    // total
    const [{ count }] = await baseQuery.clone().count({ count: '*' });

    // resultados
    const registros = await baseQuery
      .select(
        'id',
        'user_id',
        'acao',
        'entidade',
        'entidade_id',
        'detalhes',
        'ip',
        'criado_em'
      )
      .orderBy('criado_em', 'desc')
      .limit(limite)
      .offset((pagina - 1) * limite);

    return res.json({
      pagina,
      limite,
      total: Number(count) || 0,
      registros
    });

  } catch (error) {
    console.error('Erro ao listar audit_logs:', error);
    return res.status(500).json({
      error: 'Erro interno ao listar logs de auditoria.'
    });
  }
};
