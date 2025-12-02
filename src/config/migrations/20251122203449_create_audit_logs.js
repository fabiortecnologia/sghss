export function up(knex) {
  return knex.schema.createTable('audit_logs', (table) => {
    table.bigIncrements('id').primary();

    table
      .integer('user_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    table.string('acao', 50).notNullable();           // CREATE, UPDATE, DELETE, LOGIN, etc.
    table.string('entidade', 100).notNullable();      // 'pacientes', 'prontuarios', etc.
    table.integer('entidade_id').unsigned();          // id do registro afetado
    table.jsonb('detalhes');                          // JSON com diffs ou dados extras
    table.string('ip', 45);
    table.timestamp('criado_em').defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('audit_logs');
}
