import { useModals } from "../../state/ModalsContext";
import { MESES } from "../../config/constants";

// Recebe a lista de aniversariantes e o mes/igreja ja filtrados pelo Dashboard,
// que e quem controla a abertura deste modal.
export default function BdayExpandModal({ bdayList, birthMonth, dashFilterIgreja }) {
  const { setBdayExpanded } = useModals();
  const close = () => setBdayExpanded(false);

  return (
    <div className="bday-expand-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="bday-expand-card">
        <button className="bday-expand-close gm-noprint" onClick={close}>&times;</button>
        <div className="print-target">
          <div className="bday-expand-eyebrow">Aniversariantes</div>
          <div className="bday-expand-month">{MESES[birthMonth - 1]}</div>
          <div className="bday-expand-sub">{dashFilterIgreja || "Todas as igrejas"} · {bdayList.length} aniversariante(s)</div>
          <div className="bday-expand-list">
            {bdayList.length === 0 ? (
              <div className="empty-state">Nenhum aniversariante neste mês.</div>
            ) : (
              bdayList.map((m) => (
                <div className="bday-expand-row" key={m.id}>
                  <div className="bday-expand-day">{String(m._dia).padStart(2, "0")}</div>
                  <div className="bday-expand-name">{m.nome_completo || "—"}</div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="bday-expand-actions gm-noprint">
          <button className="btn btn-ghost btn-sm" onClick={close}>Fechar</button>
          <button className="btn btn-gold btn-sm" disabled={bdayList.length === 0} onClick={() => window.print()}>Imprimir</button>
        </div>
      </div>
    </div>
  );
}
