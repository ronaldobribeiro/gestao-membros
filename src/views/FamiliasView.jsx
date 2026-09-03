import { useMemo, useState } from "react";
import { useData } from "../state/DataContext";
import { useModals } from "../state/ModalsContext";
import ChipGroup from "../components/ChipGroup";
import FamiliaCard from "../components/FamiliaCard";
import { IGREJAS } from "../config/constants";
import { getFamiliaDuplicidades, getFamiliasNomesDuplicados } from "../utils/familyHelpers";
import { normalizeName } from "../utils/normalizers";
import { SemFamiliaIcon } from "../components/icons/StatIcons";
import { FamiliasIcon, UsersIcon, SearchIcon, ChevronIcon } from "../components/icons/NavIcons";

function toggleInArray(arr, value) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export default function FamiliasView() {
  const { members, familias, loadingFamilias } = useData();
  const { openFamiliaModal, openMemberModalById } = useModals();

  const [famSearch, setFamSearch] = useState("");
  const [famFilterIgrejas, setFamFilterIgrejas] = useState([]);
  const [famFilterSituacao, setFamFilterSituacao] = useState([]);
  const [famSemLimit, setFamSemLimit] = useState(40);
  const [famIgrejaMenuOpen, setFamIgrejaMenuOpen] = useState(false);
  const [famOnlySemFamilia, setFamOnlySemFamilia] = useState(false);

  const { familiaIds: duplicadoFamiliaIds, memberKeys: duplicadoMemberKeys } = useMemo(() => getFamiliaDuplicidades(members), [members]);
  const nomesDuplicados = useMemo(() => getFamiliasNomesDuplicados(familias), [familias]);

  const matchesFiltro = (m) =>
    (!famFilterIgrejas.length || famFilterIgrejas.includes(m.membresia_igreja)) &&
    (!famFilterSituacao.length || famFilterSituacao.includes(m.situacao_membro));
  const filtroAtivo = famFilterIgrejas.length > 0 || famFilterSituacao.length > 0;

  const familiasComMembros = useMemo(() => {
    const q = famSearch.trim().toLowerCase();
    return familias
      .map((f) => ({
        ...f,
        membros: members.filter((m) => m.familia_id === f.id && matchesFiltro(m))
          .map((m) => ({ ...m, duplicado: duplicadoMemberKeys.has(normalizeName(m.nome_completo)) })),
        duplicado: duplicadoFamiliaIds.has(f.id),
      }))
      .filter((f) => {
        if (filtroAtivo && f.membros.length === 0) return false;
        if (!q) return true;
        if ((f.nome_familia || "").toLowerCase().includes(q)) return true;
        return f.membros.some((m) => (m.nome_completo || "").toLowerCase().includes(q));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familias, members, famSearch, famFilterIgrejas, famFilterSituacao]);

  const semFamiliaTodos = useMemo(() => {
    const q = famSearch.trim().toLowerCase();
    return members
      .filter((m) => !m.familia_id)
      .filter((m) => !famFilterIgrejas.length || famFilterIgrejas.includes(m.membresia_igreja))
      .filter((m) => !famFilterSituacao.length || famFilterSituacao.includes(m.situacao_membro))
      .filter((m) => !q || (m.nome_completo || "").toLowerCase().includes(q));
  }, [members, famSearch, famFilterIgrejas, famFilterSituacao]);
  const semFamilia = semFamiliaTodos.slice(0, famSemLimit);

  const totalFamilias = familias.length;
  const totalVinculados = members.filter((m) => m.familia_id).length;
  const totalSemFamilia = members.filter((m) => !m.familia_id).length;

  return (
    <>
      <div className="topbar">
        <div><h2 className="page-title">Famílias</h2><p className="page-sub">Agrupe membros por núcleo familiar para facilitar o cuidado pastoral.</p></div>
      </div>

      <div className="fam-kpi-grid">
        <div className="fam-kpi"><span className="fam-kpi-icon"><FamiliasIcon /></span><div><div className="fam-kpi-label">Famílias cadastradas</div><div className="fam-kpi-value">{totalFamilias}</div></div></div>
        <div className="fam-kpi fam-kpi-ok"><span className="fam-kpi-icon"><UsersIcon /></span><div><div className="fam-kpi-label">Membros vinculados</div><div className="fam-kpi-value">{totalVinculados}</div></div></div>
        <button type="button" className={"fam-kpi fam-kpi-alert" + (famOnlySemFamilia ? " active" : "")} title="Ver membros sem família vinculada" onClick={() => setFamOnlySemFamilia((v) => !v)}>
          <span className="fam-kpi-icon"><SemFamiliaIcon /></span>
          <div><div className="fam-kpi-label">Membros sem família</div><div className="fam-kpi-value">{totalSemFamilia}</div></div>
          <span className="fam-kpi-hint">Ver lista →</span>
        </button>
      </div>

      <div className="fam-toolbar2">
        <div className="fam-search-wrap">
          <SearchIcon />
          <input type="text" placeholder="Buscar por família ou membro…" value={famSearch} onChange={(e) => { setFamSearch(e.target.value); setFamSemLimit(40); }} />
        </div>
        <div className="fam-tag-filter">
          {famFilterIgrejas.map((i) => (
            <span className="fam-tag" key={i}>{i}<button type="button" title="Remover filtro" onClick={() => setFamFilterIgrejas((s) => s.filter((x) => x !== i))}>&times;</button></span>
          ))}
          <div style={{ position: "relative" }}>
            <button type="button" className="fam-tag-add" onClick={() => setFamIgrejaMenuOpen((v) => !v)}>
              {famFilterIgrejas.length ? "+ unidade" : "Unidade/igreja"}<ChevronIcon />
            </button>
            {famIgrejaMenuOpen ? (
              <div className="fam-tag-panel">
                {IGREJAS.map((i) => (
                  <label className="fam-tag-option" key={i}>
                    <input type="checkbox" checked={famFilterIgrejas.includes(i)} onChange={() => setFamFilterIgrejas((s) => toggleInArray(s, i))} />
                    {i}
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div className="fam-seg"><ChipGroup options={["Ativo", "Inativo"]} selected={famFilterSituacao} onToggle={(v) => setFamFilterSituacao((s) => toggleInArray(s, v))} /></div>
        <div className="spacer"></div>
        <button type="button" className="btn btn-gold" onClick={() => openFamiliaModal(null)}>+ Nova família</button>
      </div>

      {famOnlySemFamilia ? (
        <div className="fam-onlysemfamilia-bar">
          <span>Mostrando apenas os membros sem família vinculada.</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFamOnlySemFamilia(false)}>Ver todas as famílias</button>
        </div>
      ) : null}

      {!famOnlySemFamilia ? (
        loadingFamilias ? (
          <div className="panel"><div className="empty-state">Carregando famílias…</div></div>
        ) : familiasComMembros.length === 0 ? (
          <div className="panel"><div className="empty-state">Nenhuma família encontrada com os filtros atuais.</div></div>
        ) : (
          <div className="fam-grid2">
            {familiasComMembros.map((f) => <FamiliaCard key={f.id} f={f} nomesDuplicados={nomesDuplicados} />)}
          </div>
        )
      ) : null}

      <div className="panel">
        <div className="panel-head">Membros sem família vinculada ({semFamiliaTodos.length})</div>
        {semFamiliaTodos.length === 0 ? (
          <div className="empty-state">Todos os membros filtrados já têm família vinculada.</div>
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <thead><tr><th>Nome</th><th>Igreja</th><th></th></tr></thead>
                <tbody>
                  {semFamilia.map((m) => (
                    <tr key={m.id}>
                      <td><div className="name-cell">{m.nome_completo || "—"}</div></td>
                      <td>{m.membresia_igreja || "—"}</td>
                      <td><button className="icon-btn" onClick={() => openMemberModalById(m.id)}>Vincular</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {semFamiliaTodos.length > semFamilia.length ? (
              <div className="toolbar" style={{ justifyContent: "center", borderTop: "1px solid var(--line)" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setFamSemLimit((v) => v + 40)}>Carregar mais ({semFamiliaTodos.length - semFamilia.length} restantes)</button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
