export function up(knex) {
  return knex.schema.table('pacientes', (table) => {
    table.timestamp('anonimizado_em').nullable();
    table
      .integer('anonimizado_por')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
  });
}

export function down(knex) {
  return knex.schema.table('pacientes', (table) => {
    table.dropColumn('anonimizado_em');
    table.dropColumn('anonimizado_por');
  });
}
