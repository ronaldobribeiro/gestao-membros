import { useMemo, useState } from "react";
import { useData } from "../state/DataContext";
import ChipGroup from "../components/ChipGroup";
import CategoryIcon from "../components/icons/CategoryIcon";
import { IGREJAS, TIPOS_MEMBRO, MINISTERIOS_LIST, PROCESSOS_LIST } from "../config/constants";
import { memberMatchesTipo } from "../utils/normalizers";
import { catColor, initials } from "../utils/icons";

function toggleInArray(arr, value) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export default function MinisteriosView() {
  const { members, vinculosMinisterios, vinculosProcessos, toggleVinculo } = useData();

  const [minGlobalIgreja, setMinGlobalIgreja] = useState("");
  const [minGlobalSituacao, setMinGlobalSituacao] = useState([]);
  const [minGlobalTipo, setMinGlobalTipo] = useState([]);
  const [minPrimary, setMinPrimary] = useState("ministerios");
  const [minSelected, setMinSelected] = useState("");
  const [minSource, setMinSource] = useState(null);
  const [minSearch, setMinSearch] = useState("");

  const minFilterIds = useMemo(() => new Set(
    members
      .filter((m) => !minGlobalIgreja || m.membresia_igreja === minGlobalIgreja)
      .filter((m) => !minGlobalSituacao.length || minGlobalSituacao.includes(m.situacao_membro))
      .filter((m) => !minGlobalTipo.length || minGlobalTipo.some((t) => memberMatchesTipo(m, t)))
      .map((m) => m.id)
  ), [members, minGlobalIgreja, minGlobalSituacao, minGlobalTipo]);

  const acolherIds = useMemo(() => new Set(members.filter((m) => m.situacao_membro !== "Inativo").map((m) => m.id)), [members]);

  const categorias = minPrimary === "ministerios" ? MINISTERIOS_LIST : PROCESSOS_LIST;
  const vinculosAtual = minPrimary === "ministerios" ? vinculosMinisterios : vinculosProcessos;
  const col = minPrimary === "ministerios" ? "ministerio" : "processo";
  const isAcolherSelected = minPrimary === "processos" && minSelected === "Acolher";

  let rightMembers = useMemo(() => {
    const q = minSearch.trim().toLowerCase();
    return members
      .filter((m) => !minGlobalIgreja || m.membresia_igreja === minGlobalIgreja)
      .filter((m) => !minGlobalSituacao.length || minGlobalSituacao.includes(m.situacao_membro))
      .filter((m) => !minGlobalTipo.length || minGlobalTipo.some((t) => memberMatchesTipo(m, t)))
      .filter((m) => !q || (m.nome_completo || "").toLowerCase().includes(q));
  }, [members, minGlobalIgreja, minGlobalSituacao, minGlobalTipo, minSearch]);
  if (isAcolherSelected) rightMembers = rightMembers.filter((m) => acolherIds.has(m.id));
  if (minSource === "funnel" && minSelected) {
    rightMembers = rightMembers.filter((m) => vinculosAtual.some((v) => v.membro_id === m.id && v[col] === minSelected));
  }

  const minCounts = MINISTERIOS_LIST.map((n) => ({ nome: n, count: vinculosMinisterios.filter((v) => v.ministerio === n && minFilterIds.has(v.membro_id)).length }));
  const procCounts = PROCESSOS_LIST.map((n) => ({
    nome: n,
    count: vinculosProcessos.filter((v) => v.processo === n && minFilterIds.has(v.membro_id) && (n !== "Acolher" || acolherIds.has(v.membro_id))).length,
  }));
  const maxMin = Math.max(1, ...minCounts.map((c) => c.count));
  const maxProc = Math.max(1, ...procCounts.map((c) => c.count));
  const acolherCount = (procCounts.find((p) => p.nome === "Acolher") || {}).count || 0;

  function selectCategory(c) { setMinSelected(c); setMinSource("list"); }
  function selectFromFunnel(type, name) {
    setMinPrimary(type === "ministerio" ? "ministerios" : "processos");
    setMinSelected(name);
    setMinSource("funnel");
  }

  const currentCategoryCount = ((minPrimary === "ministerios" ? minCounts : procCounts).find((x) => x.nome === minSelected) || {}).count || 0;

  return (
    <>
      <div className="topbar">
        <div><h2 className="page-title">Ministérios</h2><p className="page-sub">Vincule membros a ministérios e processos da igreja.</p></div>
        <select className="gm-select" value={minGlobalIgreja} onChange={(e) => setMinGlobalIgreja(e.target.value)}>
          <option value="">Todas as igrejas</option>
          {IGREJAS.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
      <div className="toolbar toolbar-standalone">
        <span className="filter-label">Situação:</span>
        <ChipGroup options={["Ativo", "Inativo"]} selected={minGlobalSituacao} onToggle={(v) => setMinGlobalSituacao((s) => toggleInArray(s, v))} />
        <span className="filter-label" style={{ marginLeft: 10 }}>Tipo:</span>
        <ChipGroup options={TIPOS_MEMBRO} selected={minGlobalTipo} onToggle={(v) => setMinGlobalTipo((s) => toggleInArray(s, v))} />
      </div>

      <div className="min-shell">
        <div className="panel">
          <div className="chip-row">
            <button className={"chip " + (minPrimary === "ministerios" ? "active" : "")} onClick={() => { setMinPrimary("ministerios"); setMinSelected(""); setMinSource(null); }}>Ministérios</button>
            <button className={"chip " + (minPrimary === "processos" ? "active" : "")} onClick={() => { setMinPrimary("processos"); setMinSelected(""); setMinSource(null); }}>Processos</button>
          </div>
          <div className="cat-grid">
            {categorias.map((c) => {
              const cnt = ((minPrimary === "ministerios" ? minCounts : procCounts).find((x) => x.nome === c) || {}).count || 0;
              const color = catColor(c);
              return (
                <button key={c} className={"cat-card " + (minSelected === c ? "active" : "")} style={{ "--cat-color": color }} onClick={() => selectCategory(c)}>
                  <span className="cat-icon"><CategoryIcon name={c} /></span>
                  <span className="cat-card-body"><span className="cat-card-name">{c}</span><span className="cat-card-count">{cnt}{cnt === 1 ? " membro" : " membros"}</span></span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="panel">
          <div className="toolbar">
            <input type="text" placeholder="Buscar por nome…" value={minSearch} onChange={(e) => setMinSearch(e.target.value)} />
            <span className="sub-cell">
              {minSelected
                ? minSelected + (isAcolherSelected ? " · exclui membros Inativos" : "") + (minSource === "funnel" ? " · " + currentCategoryCount + " membro(s) nesta categoria" : "")
                : "Selecione uma categoria à esquerda"}
            </span>
          </div>
          {!minSelected ? (
            <div className="empty-state">Escolha um ministério ou processo para ver e marcar os membros.</div>
          ) : (
            <div className="member-pick-list">
              {rightMembers.map((m) => {
                const checked = vinculosAtual.some((v) => v.membro_id === m.id && v[col] === minSelected);
                const avColor = catColor(minSelected);
                return (
                  <label className="member-pick-row" key={m.id}>
                    <input type="checkbox" checked={checked} onChange={(e) => toggleVinculo(minPrimary === "ministerios" ? "ministerio" : "processo", m.id, minSelected, e.target.checked)} />
                    <span className="member-avatar" style={{ background: `color-mix(in srgb, ${avColor} 18%, white)`, color: avColor }}>{initials(m.nome_completo)}</span>
                    <div><div className="name-cell">{m.nome_completo || "—"}</div><div className="sub-cell">{m.membresia_igreja || ""} · {m.situacao_membro || ""}</div></div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="two-col">
        <div className="panel"><div className="panel-head">Funil de Ministérios</div><div className="funnel">
          {minCounts.map((c) => {
            const color = catColor(c.nome);
            const pct = Math.max(4, (c.count / maxMin) * 100);
            return (
              <button className="funnel-row" key={c.nome} onClick={() => selectFromFunnel("ministerio", c.nome)}>
                <span className="funnel-icon" style={{ background: `color-mix(in srgb, ${color} 16%, white)`, color }}><CategoryIcon name={c.nome} /></span>
                <span className="funnel-main">
                  <span className="funnel-label-row"><span>{c.nome}</span><span className="funnel-count">{c.count}</span></span>
                  <span className="funnel-track"><span className="funnel-fill" style={{ width: pct + "%", background: color }}></span></span>
                </span>
              </button>
            );
          })}
        </div></div>
        <div className="panel"><div className="panel-head">Funil de Processos</div><div className="funnel">
          {procCounts.map((c) => {
            const color = catColor(c.nome);
            const pctLabel = c.nome !== "Acolher" && acolherCount > 0 ? " (" + ((c.count / acolherCount) * 100).toFixed(1) + "%)" : "";
            const pct = Math.max(4, (c.count / maxProc) * 100);
            return (
              <button className="funnel-row" key={c.nome} onClick={() => selectFromFunnel("processo", c.nome)}>
                <span className="funnel-icon" style={{ background: `color-mix(in srgb, ${color} 16%, white)`, color }}><CategoryIcon name={c.nome} /></span>
                <span className="funnel-main">
                  <span className="funnel-label-row"><span>{c.nome}</span><span className="funnel-count">{c.count}{pctLabel}</span></span>
                  <span className="funnel-track"><span className="funnel-fill" style={{ width: pct + "%", background: color }}></span></span>
                </span>
              </button>
            );
          })}
        </div></div>
      </div>
    </>
  );
}
