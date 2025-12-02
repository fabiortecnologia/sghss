export function up(knex) {
  return knex.schema.table('agendamentos', (table) => {
    table.string('tipo', 50).notNullable().defaultTo('CONSULTA');;
  });
}

export function down(knex) {
  return knex.schema.table('agendamentos', (table) => {
    table.dropColumn('tipo');
  });
}
