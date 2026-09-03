import { useMemo, useState } from "react";
import { useData } from "../state/DataContext";
import { useAuth } from "../state/AuthContext";
import { useModals } from "../state/ModalsContext";
import { useToast } from "../state/ToastContext";
import ChipGroup from "../components/ChipGroup";
import Pager from "../components/Pager";
import { IGREJAS, TIPOS_MEMBRO, TABELA_PAGE_SIZE, FIELDS } from "../config/constants";
import { memberMatchesTipo, normalizeName } from "../utils/normalizers";
import { fmtDate, getAge } from "../utils/formatters";
import { MailIcon, PhoneIcon, PinIcon, PencilIcon, TrashIcon } from "../components/icons/NavIcons";

function toggleInArray(arr, value) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

function getDuplicateGroups(members) {
  const map = {};
  members.forEach((m) => {
    const key = normalizeName(m.nome_completo);
    if (!key) return;
    if (!map[key]) map[key] = [];
    map[key].push(m);
  });
  return Object.values(map).filter((g) => g.length > 1);
}

async function exportXLSX(list) {
  const XLSX = await import("xlsx");
  const rows = list.map((m) => {
    const row = {};
    FIELDS.forEach((f) => { row[f.label] = m[f.key] ?? ""; });
    return row;
  });
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Membros");
  XLSX.writeFile(wb, "membros_" + new Date().toISOString().slice(0, 10) + ".xlsx");
}

export default function TabelaView() {
  const { members, familias } = useData();
  const { isAdmin } = useAuth();
  const { openMemberModal, requestDeleteMember } = useModals();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [filterIgreja, setFilterIgreja] = useState("");
  const [filterSituacao, setFilterSituacao] = useState([]);
  const [filterTipo, setFilterTipo] = useState([]);
  const [filterSexo, setFilterSexo] = useState("");
  const [tablePage, setTablePage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      if (q) {
        const hay = ((m.nome_completo || "") + " " + (m.email || "")).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filterIgreja && m.membresia_igreja !== filterIgreja) return false;
      if (filterSituacao.length && !filterSituacao.includes(m.situacao_membro)) return false;
      if (filterTipo.length && !filterTipo.some((t) => memberMatchesTipo(m, t))) return false;
      if (filterSexo && m.sexo !== filterSexo) return false;
      return true;
    });
  }, [members, search, filterIgreja, filterSituacao, filterTipo, filterSexo]);

  const totalCount = members.length;
  const totalPages = Math.max(1, Math.ceil(filtered.length / TABELA_PAGE_SIZE));
  const page = Math.min(Math.max(tablePage, 1), totalPages);
  const pageStart = (page - 1) * TABELA_PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + TABELA_PAGE_SIZE);
  const duplicateGroups = useMemo(() => getDuplicateGroups(members), [members]);

  function updateFilterSituacao(v) { setFilterSituacao((s) => toggleInArray(s, v)); setTablePage(1); }
  function updateFilterTipo(v) { setFilterTipo((s) => toggleInArray(s, v)); setTablePage(1); }

  async function handleFormLink() {
    const link = window.location.origin + "/cadastro";
    try {
      await navigator.clipboard.writeText(link);
      showToast("Link copiado: " + link);
    } catch (e) {
      window.prompt("Copie o link do formulário:", link);
    }
  }

  return (
    <>
      <div className="topbar">
        <div><h2 className="page-title">Tabela Analítica</h2><p className="page-sub">Busca e edição detalhada dos membros.</p></div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => exportXLSX(filtered)}>Exportar Excel</button>
          <button className="btn btn-ghost btn-sm" onClick={handleFormLink}>🔗 Link do formulário</button>
          <button className="btn btn-gold btn-sm" onClick={() => openMemberModal(null)}>+ Novo membro</button>
        </div>
      </div>

      {duplicateGroups.length > 0 ? (
        <div className="panel">
          <div className="panel-head">Possíveis duplicados <span className="badge badge-off">{duplicateGroups.length} grupo(s)</span></div>
          {duplicateGroups.map((g, i) => (
            <div className="dup-group" key={i}>
              <div className="dup-group-title">{g[0].nome_completo || ""}</div>
              {g.map((m) => (
                <div className="dup-row" key={m.id}>
                  <div className="sub-cell">{m.membresia_igreja || "—"} · {m.situacao_membro || "—"} · {m.email || "sem e-mail"} · {m.celular || m.fone || "sem telefone"}</div>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => openMemberModal(m)}>Ver / editar</button>
                    <button className="icon-btn" onClick={() => requestDeleteMember(m.id, m.nome_completo || "")}>Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : null}

      <div className="panel">
        <div className="toolbar">
          <input type="text" placeholder="Buscar por nome ou e-mail…" value={search} onChange={(e) => { setSearch(e.target.value); setTablePage(1); }} />
          <select className="gm-select" value={filterIgreja} onChange={(e) => { setFilterIgreja(e.target.value); setTablePage(1); }}>
            <option value="">Todas as igrejas</option>
            {IGREJAS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <select className="gm-select" value={filterSexo} onChange={(e) => { setFilterSexo(e.target.value); setTablePage(1); }}>
            <option value="">Todos os sexos</option>
            <option value="Masculino">Homem</option>
            <option value="Feminino">Mulher</option>
          </select>
        </div>
        <div className="toolbar">
          <span className="filter-label">Situação:</span>
          <ChipGroup options={["Ativo", "Inativo"]} selected={filterSituacao} onToggle={updateFilterSituacao} />
          <span className="filter-label" style={{ marginLeft: 10 }}>Tipo:</span>
          <ChipGroup options={TIPOS_MEMBRO} selected={filterTipo} onToggle={updateFilterTipo} />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">Nenhum membro encontrado com os filtros atuais.</div>
        ) : (
          <>
            <div className="table-scroll">
              <table className="tbl-membros">
                <thead><tr><th>Nome</th><th>Igreja</th><th>Tipo</th><th>Família</th><th>Contato</th><th>Situação</th><th className="th-actions">Status e ações</th></tr></thead>
                <tbody>
                  {pageItems.map((m) => {
                    const isAtivo = m.situacao_membro === "Ativo";
                    return (
                      <tr key={m.id}>
                        <td>
                          <div className="name-cell">{m.nome_completo || "—"}</div>
                          <div className="sub-cell">{m.dt_nascimento ? fmtDate(m.dt_nascimento) + (getAge(m.dt_nascimento) !== null ? " · " + getAge(m.dt_nascimento) + " anos" : "") : ""}</div>
                        </td>
                        <td><span className="cell-igreja"><PinIcon />{m.membresia_igreja || "—"}</span></td>
                        <td>{m.status_membro || "—"}</td>
                        <td>
                          <div className="sub-cell" style={{ color: "var(--ink-3)", fontWeight: 500 }}>{(familias.find((f) => f.id === m.familia_id)?.nome_familia) || "—"}</div>
                          {m.papel_familia ? <div className="sub-cell">{m.papel_familia}</div> : null}
                        </td>
                        <td>
                          {m.email || m.celular || m.fone ? (
                            <div className="contact-list">
                              {m.email ? <div className="contact-line"><MailIcon />{m.email}</div> : null}
                              {m.celular || m.fone ? <div className="contact-line"><PhoneIcon />{m.celular || m.fone}</div> : null}
                            </div>
                          ) : <span className="contact-empty">Sem contato</span>}
                        </td>
                        <td><span className={"status-pill " + (isAtivo ? "is-ativo" : "is-inativo")}><span className="dot"></span>{m.situacao_membro || "—"}</span></td>
                        <td>
                          <div className="action-icons">
                            <button className="action-icon-btn edit" title="Editar membro" aria-label="Editar" onClick={() => openMemberModal(m)}><PencilIcon /></button>
                            {isAdmin ? <button className="action-icon-btn delete" title="Excluir membro" aria-label="Excluir" onClick={() => requestDeleteMember(m.id, m.nome_completo || "")}><TrashIcon /></button> : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pager filteredCount={filtered.length} totalCount={totalCount} pageStart={pageStart} pageItemsLen={pageItems.length} totalPages={totalPages} page={page} onPageChange={setTablePage} />
          </>
        )}
      </div>
    </>
  );
}
