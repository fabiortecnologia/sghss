import bcrypt from 'bcrypt';

export async function seed(knex) {
  
  const senhaHash = await bcrypt.hash('admin1234!', 10);

  await knex('users').insert({
    nome: 'Administrador do Sistema',
    email: 'admin@vidaplus.com.br',
    senha: senhaHash,
    papel: 'ADMIN',
    ativo: true,
    criado_em: knex.fn.now(),
    atualizado_em: knex.fn.now()
  });

  console.log('Usuário ADMIN criado com sucesso!');
}
