import { ChevronLeftIcon, ChevronRightIcon } from "./icons/NavIcons";

export default function Pager({ filteredCount, totalCount, pageStart, pageItemsLen, totalPages, page, onPageChange }) {
  const from = filteredCount === 0 ? 0 : pageStart + 1;
  const to = pageStart + pageItemsLen;

  const pages = [];
  const addPage = (p) => pages.push(p);
  const addEllipsis = () => pages.push("...");
  if (totalPages <= 7) {
    for (let p = 1; p <= totalPages; p++) addPage(p);
  } else {
    addPage(1);
    if (page > 3) addEllipsis();
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) addPage(p);
    if (page < totalPages - 2) addEllipsis();
    addPage(totalPages);
  }

  return (
    <div className="table-footer">
      <div className="table-footer-count">
        Exibindo {from}–{to} de {filteredCount} membros
        {filteredCount !== totalCount ? " (de " + totalCount + " no total)" : ""}
      </div>
      <div className="table-pager">
        <button type="button" className="pager-btn" disabled={page <= 1} title="Página anterior" onClick={() => onPageChange(Math.max(1, page - 1))}>
          <ChevronLeftIcon />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={"e" + i} className="pager-ellipsis">…</span>
          ) : (
            <button key={p} type="button" className={"pager-page " + (p === page ? "active" : "")} onClick={() => onPageChange(p)}>
              {p}
            </button>
          )
        )}
        <button type="button" className="pager-btn" disabled={page >= totalPages} title="Próxima página" onClick={() => onPageChange(page + 1)}>
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}
