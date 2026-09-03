import { useMemo, useState } from "react";
import { useData } from "../state/DataContext";
import { useModals } from "../state/ModalsContext";
import { MESES, DIAS_SEMANA, AG_CATEGORIAS, agCategoryInfo } from "../config/constants";
import { fmtHorario, fmtDate, pad2, dateToISO } from "../utils/formatters";
import { eventCoversDate, eventCoversDay, getWeekStart, sortEventsByTime } from "../utils/agendaHelpers";
import { ChevronLeftIcon, ChevronRightIcon, PencilIcon, TrashIcon } from "../components/icons/NavIcons";

function AgPill({ ev, onClick }) {
  const cat = agCategoryInfo(ev.categoria);
  const time = fmtHorario(ev.horario);
  return (
    <span className="ag-pill" style={{ "--cat-color": cat.color }} title={(time ? time + " — " : "") + ev.titulo} onClick={(e) => { e.stopPropagation(); onClick(ev); }}>
      {time ? <span className="ag-pill-time">{time}</span> : null}
      <span className="ag-pill-text">{ev.titulo}</span>
    </span>
  );
}

function AgWeekPill({ ev, onClick }) {
  const cat = agCategoryInfo(ev.categoria);
  const time = fmtHorario(ev.horario);
  return (
    <span className="ag-week-pill" style={{ "--cat-color": cat.color }} onClick={(e) => { e.stopPropagation(); onClick(ev); }}>
      <span className="ag-week-pill-text">
        {time ? <span className="ag-week-pill-time">{time}</span> : null}
        <span className="ag-week-pill-title">{ev.titulo}</span>
      </span>
    </span>
  );
}

function AgendaFlatCards({ events, showMonth, onEdit, onDelete }) {
  if (!events.length) return <div className="empty-state">Nenhum evento neste período.</div>;
  return (
    <div className="ag-flat-list">
      {events.map((ev) => {
        const d = new Date(ev.data_inicio + "T00:00:00");
        const cat = agCategoryInfo(ev.categoria);
        const time = fmtHorario(ev.horario);
        const isMultiDay = ev.data_fim && ev.data_fim !== ev.data_inicio;
        const timeText = (time ? time : "") + (time && isMultiDay ? " · " : "") + (isMultiDay ? "até " + fmtDate(ev.data_fim) : "");
        return (
          <div className="ag-card" style={{ "--cat-color": cat.color }} key={ev.id}>
            <div className="ag-card-date">
              <div className="ag-card-date-day">{d.getDate()}</div>
              <div className="ag-card-date-wd">{DIAS_SEMANA[d.getDay()]}</div>
              {showMonth ? <div className="ag-card-date-mo">{MESES[d.getMonth()].slice(0, 3)}</div> : null}
            </div>
            <div className="ag-card-body">
              {(timeText || ev.categoria) ? (
                <div className="ag-card-meta">
                  {timeText ? <span className="ag-card-time">{timeText}</span> : null}
                  {ev.categoria ? <span className="ag-card-cat">{cat.label}</span> : null}
                </div>
              ) : null}
              <div className="ag-card-title-row"><span className="ag-card-title">{ev.titulo}</span></div>
              {ev.descricao ? <div className="ag-card-desc">{ev.descricao}</div> : null}
            </div>
            <div className="ag-card-actions gm-noprint">
              <button className="action-icon-btn edit" title="Editar evento" aria-label="Editar evento" onClick={() => onEdit(ev)}><PencilIcon /></button>
              <button className="action-icon-btn delete" title="Excluir evento" aria-label="Excluir evento" onClick={() => onDelete(ev)}><TrashIcon /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AgendaView() {
  const { agenda, loadingAgenda, deleteAgendaEvent } = useData();
  const { openAgendaModal } = useModals();

  const today = new Date();
  const todayISO = dateToISO(today);

  const [agFilterMonth, setAgFilterMonth] = useState(today.getMonth() + 1);
  const [agFilterYear, setAgFilterYear] = useState(today.getFullYear());
  const [agSelectedDay, setAgSelectedDay] = useState(null);
  const [agShowFullYear, setAgShowFullYear] = useState(false);
  const [agView, setAgView] = useState("month");
  const [agWeekAnchor, setAgWeekAnchor] = useState(null);

  const monthEvents = useMemo(() => {
    const first = new Date(agFilterYear, agFilterMonth - 1, 1);
    const last = new Date(agFilterYear, agFilterMonth, 0);
    return agenda
      .filter((ev) => {
        const s = new Date(ev.data_inicio + "T00:00:00");
        const e = new Date((ev.data_fim || ev.data_inicio) + "T00:00:00");
        return e >= first && s <= last;
      })
      .filter((ev) => !agSelectedDay || eventCoversDay(ev, agFilterYear, agFilterMonth, agSelectedDay))
      .sort((a, b) => a.data_inicio.localeCompare(b.data_inicio) || (a.horario || "").localeCompare(b.horario || ""));
  }, [agenda, agFilterYear, agFilterMonth, agSelectedDay]);

  const yearEvents = useMemo(() => {
    const first = new Date(agFilterYear, 0, 1);
    const last = new Date(agFilterYear, 11, 31);
    return agenda
      .filter((ev) => {
        const s = new Date(ev.data_inicio + "T00:00:00");
        const e = new Date((ev.data_fim || ev.data_inicio) + "T00:00:00");
        return e >= first && s <= last;
      })
      .sort((a, b) => a.data_inicio.localeCompare(b.data_inicio) || (a.horario || "").localeCompare(b.horario || ""));
  }, [agenda, agFilterYear]);

  const listEvents = agShowFullYear ? yearEvents : monthEvents;
  const view = agView;

  const anos = [];
  for (let y = 2021; y <= today.getFullYear() + 1; y++) anos.push(y);

  function handleNewEvent() {
    let seed = null;
    if (agSelectedDay && view !== "week") {
      seed = { data_inicio: agFilterYear + "-" + pad2(agFilterMonth) + "-" + pad2(agSelectedDay) };
    }
    openAgendaModal(seed);
  }

  function shiftMonth(delta) {
    let m = agFilterMonth + delta;
    let y = agFilterYear;
    if (m < 1) { m = 12; y -= 1; } else if (m > 12) { m = 1; y += 1; }
    setAgFilterMonth(m); setAgFilterYear(y); setAgSelectedDay(null);
  }

  function handlePrev() {
    if (view === "week") {
      const anchor = agWeekAnchor ? new Date(agWeekAnchor + "T00:00:00") : new Date();
      anchor.setDate(anchor.getDate() - 7);
      setAgWeekAnchor(dateToISO(anchor));
    } else shiftMonth(-1);
  }
  function handleNext() {
    if (view === "week") {
      const anchor = agWeekAnchor ? new Date(agWeekAnchor + "T00:00:00") : new Date();
      anchor.setDate(anchor.getDate() + 7);
      setAgWeekAnchor(dateToISO(anchor));
    } else shiftMonth(1);
  }
  function handleToday() {
    const t = new Date();
    if (view === "week") setAgWeekAnchor(dateToISO(t));
    else { setAgFilterMonth(t.getMonth() + 1); setAgFilterYear(t.getFullYear()); setAgSelectedDay(t.getDate()); }
  }

  let navLabel = "";
  if (view === "week") {
    const anchor = agWeekAnchor ? new Date(agWeekAnchor + "T00:00:00") : today;
    const wStart = getWeekStart(anchor);
    const wEnd = new Date(wStart); wEnd.setDate(wStart.getDate() + 6);
    navLabel = wStart.getMonth() === wEnd.getMonth()
      ? wStart.getDate() + " – " + wEnd.getDate() + " de " + MESES[wStart.getMonth()] + " de " + wStart.getFullYear()
      : wStart.getDate() + " " + MESES[wStart.getMonth()].slice(0, 3) + " – " + wEnd.getDate() + " " + MESES[wEnd.getMonth()].slice(0, 3) + " de " + wEnd.getFullYear();
  }

  const calNav = (
    <div className="cal-nav gm-noprint">
      <div className="cal-nav-left">
        <div className="cal-nav-arrows">
          <button type="button" className="cal-nav-arrow" title="Anterior" aria-label="Anterior" onClick={handlePrev}><ChevronLeftIcon /></button>
          <button type="button" className="cal-nav-arrow" title="Próximo" aria-label="Próximo" onClick={handleNext}><ChevronRightIcon /></button>
        </div>
        {view === "week" ? (
          <span className="cal-nav-range">{navLabel}</span>
        ) : (
          <span className="cal-nav-label">
            <select className="gm-select" value={agFilterMonth} onChange={(e) => { setAgFilterMonth(Number(e.target.value)); setAgSelectedDay(null); }}>
              {MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select className="gm-select" value={agFilterYear} onChange={(e) => { setAgFilterYear(Number(e.target.value)); setAgSelectedDay(null); }}>
              {anos.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </span>
        )}
        <button type="button" className="btn btn-ghost btn-sm" onClick={handleToday}>Hoje</button>
        {view === "month" && agSelectedDay ? <button className="btn btn-ghost btn-sm cal-nav-clear" onClick={() => setAgSelectedDay(null)}>Limpar seleção</button> : null}
      </div>
      <div className="ag-legend gm-noprint">
        {AG_CATEGORIAS.map((c) => (
          <span className="ag-legend-item" key={c.key}><span className="ag-legend-dot" style={{ "--cat-color": c.color }}></span>{c.label}</span>
        ))}
      </div>
    </div>
  );

  let mainPanel = null;
  if (view === "week") {
    const anchor = agWeekAnchor ? new Date(agWeekAnchor + "T00:00:00") : today;
    const wStart = getWeekStart(anchor);
    const cols = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(wStart); d.setDate(wStart.getDate() + i);
      const iso = dateToISO(d);
      const dayEvents = sortEventsByTime(agenda.filter((ev) => eventCoversDate(ev, d)));
      const isToday = iso === todayISO;
      cols.push(
        <div className="ag-week-col" key={iso}>
          <div className="ag-week-col-head"><div className="ag-week-col-weekday">{DIAS_SEMANA[d.getDay()]}</div><div className={"ag-week-col-num" + (isToday ? " today" : "")}>{d.getDate()}</div></div>
          <div className="ag-week-col-body">
            {dayEvents.length ? dayEvents.map((ev) => <AgWeekPill key={ev.id} ev={ev} onClick={openAgendaModal} />) : <div className="ag-week-empty">—</div>}
          </div>
        </div>
      );
    }
    mainPanel = <div className="panel ag-panel-shadow">{calNav}<div className="ag-week-grid">{cols}</div></div>;
  } else if (view !== "list") {
    const year = agFilterYear, month = agFilterMonth;
    const first = new Date(year, month - 1, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const prevMonthDays = new Date(year, month - 1, 0).getDate();
    const cellsArr = [];
    for (let i = startWeekday - 1; i >= 0; i--) cellsArr.push({ day: prevMonthDays - i, other: true, dateObj: new Date(year, month - 2, prevMonthDays - i) });
    for (let d = 1; d <= daysInMonth; d++) cellsArr.push({ day: d, other: false, dateObj: new Date(year, month - 1, d) });
    const remainder = (7 - (cellsArr.length % 7)) % 7;
    for (let d = 1; d <= remainder; d++) cellsArr.push({ day: d, other: true, dateObj: new Date(year, month, d) });

    mainPanel = (
      <div className="panel ag-panel-shadow">
        {calNav}
        <div className="cal-weekdays-flat">{DIAS_SEMANA.map((d) => <div className="cal-weekday-flat" key={d}>{d}</div>)}</div>
        <div className="cal-grid-flat">
          {cellsArr.map((c, idx) => {
            const iso = dateToISO(c.dateObj);
            const dayEvents = sortEventsByTime(agenda.filter((ev) => eventCoversDate(ev, c.dateObj)));
            const has = dayEvents.length > 0;
            const shown = dayEvents.slice(0, 3);
            const extra = dayEvents.length - shown.length;
            const isToday = iso === todayISO;
            const isSelected = !c.other && agSelectedDay === c.day;
            return (
              <button
                type="button" key={idx}
                className={"cal-cell-flat" + (c.other ? " other-month" : "") + (isSelected ? " selected" : "")}
                onClick={() => { if (!c.other) setAgSelectedDay(agSelectedDay === c.day ? null : c.day); }}
              >
                <span className={"cal-cell-num" + (isToday ? " cal-cell-num-today" : "")}>{c.day}</span>
                {has ? (
                  <span className="cal-cell-pills">
                    {shown.map((ev) => <AgPill key={ev.id} ev={ev} onClick={openAgendaModal} />)}
                    {extra > 0 ? <span className="cal-cell-more">+{extra} mais</span> : null}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const sidePanel = (
    <div className="panel ag-panel-shadow">
      <div className="panel-head"><span className="ag-panel-title">{agShowFullYear ? "Eventos de " + agFilterYear : "Eventos do mês"}</span> <span className="badge badge-off ag-panel-count">{listEvents.length}</span></div>
      <div className="print-target">
        <div className="print-header"><h3 className="ag-print-title">{agShowFullYear ? "Eventos de " + agFilterYear : "Eventos de " + MESES[agFilterMonth - 1] + " de " + agFilterYear}</h3></div>
        {loadingAgenda ? (
          <div className="empty-state">Carregando…</div>
        ) : (
          <AgendaFlatCards events={listEvents} showMonth={agShowFullYear} onEdit={openAgendaModal} onDelete={(ev) => deleteAgendaEvent(ev.id, ev.titulo)} />
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="topbar">
        <div><h2 className="page-title">Agendamentos</h2><p className="page-sub">Calendário de eventos e comentários da igreja.</p></div>
        <div className="ag-header-actions gm-noprint">
          <div className="ag-view-switch">
            {["month", "week", "list"].map((v) => (
              <button key={v} type="button" className={"ag-view-btn " + (view === v ? "active" : "")} onClick={() => setAgView(v)}>
                {v === "month" ? "Mês" : v === "week" ? "Semana" : "Lista"}
              </button>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setAgShowFullYear((v) => !v)}>{agShowFullYear ? "Voltar ao mês" : "Listar ano"}</button>
          <button className="btn btn-ghost btn-sm" disabled={listEvents.length === 0} onClick={() => window.print()}>Imprimir / PDF</button>
          <button className="btn btn-gold btn-sm" onClick={handleNewEvent}>+ Novo evento</button>
        </div>
      </div>
      <div className={"ag-shell" + (view === "list" ? " list-mode" : "")}>
        {view === "list" ? null : mainPanel}
        {sidePanel}
      </div>
    </>
  );
}
