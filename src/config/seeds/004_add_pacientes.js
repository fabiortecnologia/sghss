
/**
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  const existentes = await knex("pacientes").count("* as total");
  if (existentes[0].total > 0) {
    console.log("Pacientes já existem — seed ignorado.");
    return;
  }

  const fakeEncrypt = (cpf) => {
    const reversed = cpf.split("").reverse().join("");
    return Buffer.from(reversed).toString("base64");
  };

  await knex("pacientes").insert([
    {
      user_id: null,
      nome: "Ana Clara Martins",
      cpf_criptografado: fakeEncrypt("12345678901"),
      data_nascimento: "1990-05-14",
      telefone: "11988776655",
      email: "ana.clara@exemplo.com",
      endereco: {
        rua: "Rua das Flores",
        numero: "120",
        bairro: "Centro",
        cidade: "São Paulo",
        cep: "01001-000"
      },
      consentimento_lgpd: true,
      ativo: true
    },
    {
      user_id: null,
      nome: "Bruno Ferreira Alves",
      cpf_criptografado: fakeEncrypt("98765432100"),
      data_nascimento: "1985-09-30",
      telefone: "11999887766",
      email: "bruno.alves@exemplo.com",
      endereco: {
        rua: "Av. Brasil",
        numero: "455",
        bairro: "Jardim América",
        cidade: "Curitiba",
        cep: "80730-000"
      },
      consentimento_lgpd: true,
      ativo: true
    },
    {
      user_id: null,
      nome: "Camila Rodrigues Santos",
      cpf_criptografado: fakeEncrypt("45678912355"),
      data_nascimento: "1999-11-02",
      telefone: "11988775544",
      email: "camila.santos@exemplo.com",
      endereco: {
        rua: "Rua Joaquim Nabuco",
        numero: "88",
        bairro: "Boa Vista",
        cidade: "Recife",
        cep: "50060-000"
      },
      consentimento_lgpd: true,
      ativo: true
    },
    {
      user_id: null,
      nome: "Leonardo Borges Lima",
      cpf_criptografado: fakeEncrypt("15975348620"),
      data_nascimento: "1978-01-12",
      telefone: "11977665544",
      email: "leonardo.lima@exemplo.com",
      endereco: {
        rua: "Rua XV de Novembro",
        numero: "300",
        bairro: "Centro",
        cidade: "Curitiba",
        cep: "80020-310"
      },
      consentimento_lgpd: true,
      ativo: true
    },
    {
      user_id: null,
      nome: "Mariana Oliveira Lopes",
      cpf_criptografado: fakeEncrypt("74125896300"),
      data_nascimento: "1995-07-20",
      telefone: "11966554433",
      email: "mariana.lopes@exemplo.com",
      endereco: {
        rua: "Av. Ipiranga",
        numero: "900",
        bairro: "Bela Vista",
        cidade: "Porto Alegre",
        cep: "90160-093"
      },
      consentimento_lgpd: true,
      ativo: true
    }
  ]);

  console.log("Seeds de pacientes inseridos com sucesso!");
}
