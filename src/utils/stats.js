import { IGREJAS } from "../config/constants";
import { getAge } from "./formatters";

export function computeStats(list) {
  const total = list.length;
  const ativos = list.filter((m) => m.situacao_membro === "Ativo").length;
  const inativos = list.filter((m) => m.situacao_membro === "Inativo").length;
  const homens = list.filter((m) => m.sexo === "Masculino").length;
  const mulheres = list.filter((m) => m.sexo === "Feminino").length;
  const year = new Date().getFullYear();
  const novos = list.filter((m) => m.dt_entrada && new Date(m.dt_entrada).getFullYear() === year).length;

  const bands = [
    { label: "0–11", min: 0, max: 11 }, { label: "12–17", min: 12, max: 17 }, { label: "18–30", min: 18, max: 30 },
    { label: "31–50", min: 31, max: 50 }, { label: "51–65", min: 51, max: 65 }, { label: "66+", min: 66, max: 999 },
  ];
  const ageCounts = bands.map((b) => ({ ...b, count: list.filter((m) => { const age = getAge(m.dt_nascimento); return age !== null && age >= b.min && age <= b.max; }).length }));
  const maxAge = Math.max(1, ...ageCounts.map((b) => b.count));

  const porIgreja = IGREJAS.map((ig) => ({ nome: ig, count: list.filter((m) => m.membresia_igreja === ig).length }));

  const anos = [];
  for (let y = 2021; y <= year; y++) anos.push(y);
  // Base: membros sem data de entrada registrada sao considerados parte do total ja existente antes do inicio do controle (2021).
  const semDataEntrada = list.filter((m) => !m.dt_entrada).length;
  const cumulativeUntil = (y) => semDataEntrada + list.filter((m) => m.dt_entrada && new Date(m.dt_entrada).getFullYear() <= y).length;
  const porAno = anos.map((y) => {
    const count = list.filter((m) => m.dt_entrada && new Date(m.dt_entrada).getFullYear() === y).length;
    const prevTotal = cumulativeUntil(y - 1);
    let growth = null;
    if (prevTotal > 0) growth = (count / prevTotal) * 100;
    else if (count > 0) growth = "novo";
    return { ano: y, count, growth };
  });
  const maxAno = Math.max(1, ...porAno.map((b) => b.count));

  return { total, ativos, inativos, homens, mulheres, novos, ageCounts, maxAge, porIgreja, porAno, maxAno };
}
