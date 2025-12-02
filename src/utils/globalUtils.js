export const convertDateBRToISO = (dataBR) => {
  // Exemplo: "01/12/2025 14:00:00"
  const regex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})(?::(\d{2}))?$/;

  const match = dataBR.match(regex);
  if (!match) return null;

  const [_, dia, mes, ano, hora, minuto, segundo = "00"] = match;

  // Monta string ISO
  return `${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}-03:00`;
};


export function formatarDataHoraBR(data) {
  if (!data) return null;

  const d = new Date(data);

  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();

  const horas = String(d.getHours()).padStart(2, '0');
  const minutos = String(d.getMinutes()).padStart(2, '0');

  return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}
