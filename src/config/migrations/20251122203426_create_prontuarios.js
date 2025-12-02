export function up(knex) {
  return knex.schema.createTable('prontuarios', (table) => {
    table.increments('id').primary();

    table
      .integer('agendamento_id')
      .unsigned()
      .references('id')
      .inTable('agendamentos')
      .onDelete('SET NULL');

    table
      .integer('paciente_id')
      .unsigned()
      .references('id')
      .inTable('pacientes')
      .onDelete('CASCADE');

    table
      .integer('profissional_id')
      .unsigned()
      .references('id')
      .inTable('profissionais')
      .onDelete('SET NULL');

    table.string('tipo_registro', 50); // CONSULTA, RETORNO, RECEITA, etc.
    table.text('notas');
    table.jsonb('prescricoes'); // JSON com medicamentos/doses
    table.jsonb('anexos'); // metadados de arquivos (URLs, nomes)
    table
      .string('visibilidade', 30)
      .notNullable()
      .defaultTo('PRIVADO'); // PRIVADO, COMPARTILHADO

    table.timestamp('criado_em').defaultTo(knex.fn.now());
    table
      .integer('criado_por')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('prontuarios');
}
