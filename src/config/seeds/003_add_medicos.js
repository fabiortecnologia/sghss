/**
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  // Senha padrão: 123456 (hash já usado nos outros seeds)
  const senhaHash = "$2b$10$3GJwZKzYdJ9yZCDY85eV5u1z3p4Ka1tZ5KfBLhp1P/L9kglsPuU6a";

  // --------------------------
  // 1. Criar Usuários (users)
  // --------------------------
  const [userJulia] = await knex("users")
    .insert({
      nome: "Dra. Julia Costa",
      email: "julia.costa@vidaplus.com",
      senha: senhaHash,
      papel: "PROFESSIONAL",
      ativo: true
    })
    .returning("id");

  const [userAna] = await knex("users")
    .insert({
      nome: "Dra. Ana Souza",
      email: "ana.souza@vidaplus.com",
      senha: senhaHash,
      papel: "PROFESSIONAL",
      ativo: true
    })
    .returning("id");

  const [userAdao] = await knex("users")
    .insert({
      nome: "Dr. Adao Silva",
      email: "adao.silva@vidaplus.com",
      senha: senhaHash,
      papel: "PROFESSIONAL",
      ativo: true
    })
    .returning("id");

  const [userShaun] = await knex("users")
    .insert({
      nome: "Dr. Shaun Murphy",
      email: "shaun.murphy@vidaplus.com",
      senha: senhaHash,
      papel: "PROFESSIONAL",
      ativo: true
    })
    .returning("id");

  // --------------------------
  // 2. Criar Profissionais
  // --------------------------
  await knex("profissionais").insert([
    {
      user_id: userJulia.id,
      nome: "Dra. Julia Costa",
      crm: "CRM-34345",
      especialidade: "Ortopedista",
      telefone: "11999999998",
      email: "julia.costa@vidaplus.com",
      ativo: true
    },
    {
      user_id: userAna.id,
      nome: "Dra. Ana Souza",
      crm: "CRM-12345",
      especialidade: "Cardiologia",
      telefone: "11999999999",
      email: "ana.souza@vidaplus.com",
      ativo: true
    },
    {
      user_id: userAdao.id,
      nome: "Dr. Adao Silva",
      crm: "CRM-95325",
      especialidade: "Clinico Geral",
      telefone: "11999999995",
      email: "adao.silva@vidaplus.com",
      ativo: true
    },
    {
      user_id: userShaun.id,
      nome: "Dr. Shaun Murphy",
      crm: "CRM-55599",
      especialidade: "Neuro",
      telefone: "11999999988",
      email: "shaun.murphy@vidaplus.com",
      ativo: true
    }
  ]);

  console.log("Médicos adicionados com sucesso!");
}
