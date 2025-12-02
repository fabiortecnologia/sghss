export function up(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('nome', 150).notNullable();
    table.string('email', 150).unique().notNullable();
    table.string('senha').notNullable();
    table.string('papel', 30).notNullable().defaultTo('RECEPTIONIST'); // ADMIN, RECEPTIONIST, PROFESSIONAL, PATIENT
    table.boolean('ativo').defaultTo(true);
    table.timestamp('criado_em').defaultTo(knex.fn.now());
    table.timestamp('atualizado_em').defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('users');
}
