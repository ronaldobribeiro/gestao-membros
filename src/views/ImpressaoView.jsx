import { useMemo, useState } from "react";
import { useData } from "../state/DataContext";
import ChipGroup from "../components/ChipGroup";
import { IGREJAS, TIPOS_MEMBRO, PRINT_FIELDS } from "../config/constants";
import { memberMatchesTipo } from "../utils/normalizers";
import { fmtDate, getAge } from "../utils/formatters";

function toggleInArray(arr, value) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

const DEFAULT_FIELDS = {
  nome_completo: true, assinatura: true, telefone: false, email: false,
  endereco: false, dt_nascimento: false, membresia_igreja: false, situacao_membro: false, status_membro: false,
};

export default function ImpressaoView() {
  const { members, familias } = useData();

  const [printFilterIgreja, setPrintFilterIgreja] = useState("");
  const [printFilterSituacao, setPrintFilterSituacao] = useState([]);
  const [printFilterTipo, setPrintFilterTipo] = useState([]);
  const [printIncluirMenores, setPrintIncluirMenores] = useState(true);
  const [printFields, setPrintFields] = useState(DEFAULT_FIELDS);

  const list = useMemo(() => {
    return members
      .filter((m) => !printFilterIgreja || m.membresia_igreja === printFilterIgreja)
      .filter((m) => !printFilterSituacao.length || printFilterSituacao.includes(m.situacao_membro))
      .filter((m) => !printFilterTipo.length || printFilterTipo.some((t) => memberMatchesTipo(m, t)))
      .filter((m) => {
        if (printIncluirMenores) return true;
        const age = getAge(m.dt_nascimento);
        return age === null || age >= 18;
      })
      .sort((a, b) => (a.nome_completo || "").localeCompare(b.nome_completo || "", "pt-BR"));
  }, [members, printFilterIgreja, printFilterSituacao, printFilterTipo, printIncluirMenores]);

  const selectedFields = PRINT_FIELDS.filter((f) => printFields[f.key]);
  const filtrosResumo = [
    printFilterIgreja || "Todas as igrejas",
    printFilterSituacao.length ? printFilterSituacao.join("/") : "Todas as situações",
    printFilterTipo.length ? printFilterTipo.join("/") : "Todos os tipos",
    printIncluirMenores ? "Com menores de idade" : "Sem menores de idade",
  ].join(" · ");

  function getFamiliaNome(m) {
    if (!m.familia_id) return "";
    return familias.find((f) => f.id === m.familia_id)?.nome_familia || "";
  }

  return (
    <>
      <div className="topbar"><div><h2 className="page-title">Impressão</h2><p className="page-sub">Gere listas para assembleia ou controle, com os campos que precisar.</p></div></div>
      <div className="panel gm-noprint">
        <div className="panel-head">Filtros</div>
        <div className="toolbar">
          <select className="gm-select" value={printFilterIgreja} onChange={(e) => setPrintFilterIgreja(e.target.value)}>
            <option value="">Todas as igrejas</option>
            {IGREJAS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className="toolbar">
          <span className="filter-label">Situação:</span>
          <ChipGroup options={["Ativo", "Inativo"]} selected={printFilterSituacao} onToggle={(v) => setPrintFilterSituacao((s) => toggleInArray(s, v))} />
          <span className="filter-label" style={{ marginLeft: 10 }}>Tipo:</span>
          <ChipGroup options={TIPOS_MEMBRO} selected={printFilterTipo} onToggle={(v) => setPrintFilterTipo((s) => toggleInArray(s, v))} />
        </div>
        <div className="toolbar">
          <span className="filter-label">Menores de idade:</span>
          <label className="switch-wrap">
            <input type="checkbox" checked={printIncluirMenores} onChange={(e) => setPrintIncluirMenores(e.target.checked)} />
            <span className="switch-track"><span className="switch-thumb"></span></span>
            <span className="switch-label">{printIncluirMenores ? "Incluindo menores de idade" : "Somente maiores de idade"}</span>
          </label>
        </div>
        <div className="panel-head" style={{ borderTop: "1px solid var(--line)" }}>Campos a imprimir</div>
        <div className="check-list">
          {PRINT_FIELDS.map((f) => (
            <label className="check-row" key={f.key}>
              <input type="checkbox" checked={!!printFields[f.key]} onChange={(e) => setPrintFields((prev) => ({ ...prev, [f.key]: e.target.checked }))} />
              {f.label}
            </label>
          ))}
        </div>
        <div className="toolbar" style={{ borderTop: "1px solid var(--line)", borderBottom: "none" }}>
          <span className="sub-cell">{list.length} membro(s) correspondem aos filtros — {filtrosResumo}</span>
          <div className="spacer"></div>
          <button className="btn btn-gold btn-sm" disabled={selectedFields.length === 0} onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        </div>
      </div>
      <div className="panel">
        <div className="print-target">
          <div className="print-header"><h3>Lista de Membros</h3><p>{filtrosResumo} · Emitido em {new Date().toLocaleDateString("pt-BR")} · {list.length} membro(s)</p></div>
          {selectedFields.length === 0 ? (
            <div className="empty-state">Selecione ao menos um campo para gerar a lista.</div>
          ) : (
            <div className="table-scroll">
              <table className="print-table">
                <thead><tr><th style={{ width: 36 }}>#</th>{selectedFields.map((f) => <th key={f.key}>{f.label === "Assinatura (coluna em branco)" ? "Assinatura" : f.label}</th>)}</tr></thead>
                <tbody>
                  {list.map((m, i) => (
                    <tr key={m.id}>
                      <td>{i + 1}</td>
                      {selectedFields.map((f) => {
                        if (f.key === "assinatura") return <td className="sig-cell" key={f.key}>&nbsp;</td>;
                        if (f.key === "telefone") return <td key={f.key}>{m.celular || m.fone || ""}</td>;
                        if (f.key === "dt_nascimento") return <td key={f.key}>{fmtDate(m.dt_nascimento)}</td>;
                        if (f.key === "familia") return <td key={f.key}>{getFamiliaNome(m)}</td>;
                        return <td key={f.key}>{m[f.key] || ""}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
