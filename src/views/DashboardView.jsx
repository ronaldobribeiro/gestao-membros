import { useMemo, useState } from "react";
import { useData } from "../state/DataContext";
import { useModals } from "../state/ModalsContext";
import ChipGroup from "../components/ChipGroup";
import BdayExpandModal from "../components/modals/BdayExpandModal";
import { IGREJAS, MESES } from "../config/constants";
import { memberMatchesTipo } from "../utils/normalizers";
import { computeStats } from "../utils/stats";
import { TotalIcon, AtivosIcon, InativosIcon, HomensIcon, MulheresIcon, NovosIcon, SemFamiliaIcon } from "../components/icons/StatIcons";

function toggleInArray(arr, value) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export default function DashboardView() {
  const { members } = useData();
  const { bdayExpanded, setBdayExpanded } = useModals();

  const [dashFilterIgreja, setDashFilterIgreja] = useState("");
  const [dashFilterSituacao, setDashFilterSituacao] = useState([]);
  const [dashFilterTipo, setDashFilterTipo] = useState([]);
  const [birthMonth, setBirthMonth] = useState(new Date().getMonth() + 1);

  const list = useMemo(() => members
    .filter((m) => !dashFilterIgreja || m.membresia_igreja === dashFilterIgreja)
    .filter((m) => !dashFilterSituacao.length || dashFilterSituacao.includes(m.situacao_membro))
    .filter((m) => !dashFilterTipo.length || dashFilterTipo.some((t) => memberMatchesTipo(m, t))),
    [members, dashFilterIgreja, dashFilterSituacao, dashFilterTipo]);

  const stats = useMemo(() => computeStats(list), [list]);

  const bdayList = useMemo(() => {
    return list
      .filter((m) => {
        if (!m.dt_nascimento) return false;
        const d = new Date(m.dt_nascimento + "T00:00:00");
        if (isNaN(d)) return false;
        return d.getMonth() + 1 === birthMonth;
      })
      .map((m) => {
        const d = new Date(m.dt_nascimento + "T00:00:00");
        return { ...m, _dia: d.getDate(), _completa: new Date().getFullYear() - d.getFullYear() };
      })
      .sort((a, b) => a._dia - b._dia);
  }, [list, birthMonth]);

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();

  return (
    <>
      <div className="topbar gm-noprint">
        <div><h2 className="page-title">Dashboard</h2><p className="page-sub">Visão geral dos membros cadastrados.</p></div>
        <select className="gm-select" value={dashFilterIgreja} onChange={(e) => setDashFilterIgreja(e.target.value)}>
          <option value="">Todas as igrejas</option>
          {IGREJAS.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      <div className="toolbar toolbar-standalone gm-noprint">
        <span className="filter-label">Situação:</span>
        <ChipGroup options={["Ativo", "Inativo"]} selected={dashFilterSituacao} onToggle={(v) => setDashFilterSituacao((s) => toggleInArray(s, v))} />
        <span className="filter-label" style={{ marginLeft: 10 }}>Tipo:</span>
        <ChipGroup options={["Membro Professo", "Não professos", "Frequentes"]} selected={dashFilterTipo} onToggle={(v) => setDashFilterTipo((s) => toggleInArray(s, v))} />
      </div>

      <div className="stats-grid">
        <div className="stat-card"><span className="stat-icon c-ink"><TotalIcon /></span><div className="stat-body"><div className="stat-label">Total de membros</div><div className="stat-value">{stats.total}</div></div></div>
        <div className="stat-card"><span className="stat-icon c-ok"><AtivosIcon /></span><div className="stat-body"><div className="stat-label">Ativos</div><div className="stat-value ok">{stats.ativos}</div></div></div>
        <div className="stat-card"><span className="stat-icon c-warn"><InativosIcon /></span><div className="stat-body"><div className="stat-label">Inativos</div><div className="stat-value warn">{stats.inativos}</div></div></div>
        <div className="stat-card"><span className="stat-icon c-blue"><HomensIcon /></span><div className="stat-body"><div className="stat-label">Homens</div><div className="stat-value">{stats.homens}</div></div></div>
        <div className="stat-card"><span className="stat-icon c-violet"><MulheresIcon /></span><div className="stat-body"><div className="stat-label">Mulheres</div><div className="stat-value">{stats.mulheres}</div></div></div>
        <div className="stat-card"><span className="stat-icon c-teal"><NovosIcon /></span><div className="stat-body"><div className="stat-label">Novos em {anoAtual}</div><div className="stat-value gold">{stats.novos}</div></div></div>
        <div className="stat-card"><span className="stat-icon c-danger"><SemFamiliaIcon /></span><div className="stat-body"><div className="stat-label">Sem família vinculada</div><div className="stat-value warn">{list.filter((m) => !m.familia_id).length}</div></div></div>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head">Distribuição por idade</div>
          <div className="age-bars">
            {stats.ageCounts.map((b) => {
              const pct = stats.total > 0 ? ((b.count / stats.total) * 100).toFixed(1) : "0.0";
              return (
                <div className="age-row" key={b.label}>
                  <div className="age-row-label">{b.label}</div>
                  <div className="age-row-track"><div className="age-row-fill" style={{ width: (b.count / stats.maxAge) * 100 + "%" }}></div></div>
                  <div className="age-row-count">{b.count} <span className="age-row-pct">({pct}%)</span></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">Membros por igreja</div>
          <div className="age-bars">
            {stats.porIgreja.map((b) => (
              <div className="age-row" key={b.nome}>
                <div className="age-row-label" style={{ width: 150 }}>{b.nome}</div>
                <div className="age-row-track"><div className="age-row-fill" style={{ width: (b.count / Math.max(1, stats.total)) * 100 + "%" }}></div></div>
                <div className="age-row-count">{b.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">Recebimentos por ano (a partir de 2021)</div>
        <div className="age-bars">
          {stats.porAno.map((b) => {
            let growthHtml = null;
            if (b.growth === "novo") growthHtml = <span className="age-row-growth up">novo</span>;
            else if (typeof b.growth === "number") {
              const cls = b.growth > 0 ? "up" : (b.growth < 0 ? "down" : "");
              const sign = b.growth > 0 ? "+" : "";
              growthHtml = <span className={"age-row-growth " + cls}>{sign}{b.growth.toFixed(1)}%</span>;
            }
            return (
              <div className="age-row" key={b.ano}>
                <div className="age-row-label">{b.ano}</div>
                <div className="age-row-track"><div className="age-row-fill" style={{ width: (b.count / stats.maxAno) * 100 + "%" }}></div></div>
                <div className="age-row-count">{b.count} {growthHtml}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head gm-noprint">
          Aniversariantes
          <div style={{ display: "flex", gap: 8 }}>
            <select className="gm-select" value={birthMonth} onChange={(e) => setBirthMonth(Number(e.target.value))}>
              {MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <button className="btn btn-ghost btn-sm" disabled={bdayList.length === 0} onClick={() => setBdayExpanded(true)}>Ampliar</button>
            <button className="btn btn-ghost btn-sm" disabled={bdayList.length === 0} onClick={() => window.print()}>Imprimir</button>
          </div>
        </div>
        <div className="print-target">
          <div className="print-header">
            <h3>Aniversariantes de {MESES[birthMonth - 1]}</h3>
            <p>{dashFilterIgreja || "Todas as igrejas"} · {bdayList.length} membro(s)</p>
          </div>
          {bdayList.length === 0 ? (
            <div className="empty-state">Nenhum aniversariante em {MESES[birthMonth - 1]}.</div>
          ) : (
            <table className="print-table">
              <thead><tr><th style={{ width: 60 }}>Dia</th><th>Nome</th><th>Completa</th><th>Igreja</th></tr></thead>
              <tbody>
                {bdayList.map((m) => (
                  <tr key={m.id}>
                    <td className="bday-day">{String(m._dia).padStart(2, "0")}</td>
                    <td className="name-cell">
                      {m.nome_completo || "—"}
                      {m._dia === hoje.getDate() && birthMonth === hoje.getMonth() + 1 ? <span className="badge badge-gold"> Hoje 🎂</span> : null}
                    </td>
                    <td>{m._completa} anos</td>
                    <td>{m.membresia_igreja || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {bdayExpanded ? <BdayExpandModal bdayList={bdayList} birthMonth={birthMonth} dashFilterIgreja={dashFilterIgreja} /> : null}
    </>
  );
}
