export function up(knex) {
  return knex.schema.table('prontuarios', (table) => {
    table
      .timestamp('atualizado_em')
      .defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.table('prontuarios', (table) => {
    table.dropColumn('atualizado_em');
  });
}
