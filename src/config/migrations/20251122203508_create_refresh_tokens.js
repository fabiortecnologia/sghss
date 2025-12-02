export function up(knex) {
  return knex.schema.createTable('refresh_tokens', (table) => {
    table.increments('id').primary();

    table
      .integer('user_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.string('token').notNullable().unique();
    table.timestamp('expira_em').notNullable();
    table.boolean('revogado').defaultTo(false);
    table.timestamp('criado_em').defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('refresh_tokens');
}