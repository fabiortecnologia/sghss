export function up(knex) {
  return knex.schema.table('agendamentos', (table) => {
    table.text('observacoes').nullable();
  });
}

export function down(knex) {
  return knex.schema.table('agendamentos', (table) => {
    table.dropColumn('observacoes');
  });
}
