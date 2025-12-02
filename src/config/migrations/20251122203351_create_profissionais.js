export function up(knex) {
  return knex.schema.createTable('profissionais', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.string('nome', 150).notNullable();
    table.string('crm', 50);
    table.string('especialidade', 100);
    table.string('telefone', 30);
    table.string('email', 150);
    table.boolean('ativo').defaultTo(true);
    table.timestamp('criado_em').defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('profissionais');
}
