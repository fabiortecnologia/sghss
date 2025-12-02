export function up(knex) {
  return knex.schema.createTable('pacientes', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.string('nome', 150).notNullable();
    table.string('cpf_criptografado').unique(); 
    table.date('data_nascimento');
    table.string('telefone', 30);
    table.string('email', 150);
    table.jsonb('endereco');
    table.boolean('consentimento_lgpd').defaultTo(false);
    table.boolean('ativo').defaultTo(true);
    table.timestamp('criado_em').defaultTo(knex.fn.now());
    table.timestamp('atualizado_em').defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('pacientes');
}
