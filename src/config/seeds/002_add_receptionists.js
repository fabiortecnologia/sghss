/**
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  // Inserir usuários recepcionistas
  const [user1] = await knex('users')
    .insert({
      nome: 'Maria Fernanda Lima',
      email: 'maria.lima@vidaplus.com',
      senha: '$2b$10$3GJwZKzYdJ9yZCDY85eV5u1z3p4Ka1tZ5KfBLhp1P/L9kglsPuU6a', // senha: 123456
      papel: 'RECEPTIONIST',
      ativo: true
    })
    .returning('id');

  const [user2] = await knex('users')
    .insert({
      nome: 'Carlos Alberto Mendes',
      email: 'carlos.mendes@vidaplus.com',
      senha: '$2b$10$3GJwZKzYdJ9yZCDY85eV5u1z3p4Ka1tZ5KfBLhp1P/L9kglsPuU6a', // senha: 123456
      papel: 'RECEPTIONIST',
      ativo: true
    })
    .returning('id');


  console.log('Recepcionistas adicionados com sucesso:', user1.id, user2.id);
}
