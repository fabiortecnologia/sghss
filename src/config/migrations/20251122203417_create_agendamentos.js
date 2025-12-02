export function up(knex) {
  return knex.schema
    .createTable('agendamentos', (table) => {
      table.increments('id').primary();

      table
        .integer('paciente_id')
        .unsigned()
        .references('id')
        .inTable('pacientes')
        .onDelete('SET NULL');

      table
        .integer('profissional_id')
        .unsigned()
        .references('id')
        .inTable('profissionais')
        .onDelete('SET NULL');

      table.timestamp('data_horario').notNullable();
      table.integer('duracao_minutos').defaultTo(30);
      table
        .string('status', 30)
        .notNullable()
        .defaultTo('AGENDADO'); // AGENDADO, CANCELADO, CONCLUIDO

      table
        .integer('criado_por')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');

      table.timestamp('criado_em').defaultTo(knex.fn.now());
      table.timestamp('atualizado_em').defaultTo(knex.fn.now());
    })
    .then(() =>
      knex.schema.raw(
        'CREATE INDEX agendamentos_prof_data_idx ON agendamentos (profissional_id, data_horario)'
      )
    );
}

export function down(knex) {
  return knex.schema.dropTableIfExists('agendamentos');
}
