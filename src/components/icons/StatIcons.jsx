// Icones das estatisticas do dashboard/familias — equivalentes ao antigo STAT_ICON_SVG.
const common = { fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };

export const TotalIcon = (p) => (
  <svg viewBox="0 0 24 24" {...common} {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);
export const AtivosIcon = (p) => (
  <svg viewBox="0 0 24 24" {...common} {...p}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
export const InativosIcon = (p) => (
  <svg viewBox="0 0 24 24" {...common} {...p}>
    <circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
  </svg>
);
export const HomensIcon = (p) => (
  <svg viewBox="0 0 24 24" {...common} {...p}>
    <circle cx="10" cy="14" r="6"></circle><line x1="14.5" y1="9.5" x2="21" y2="3"></line><polyline points="15 3 21 3 21 9"></polyline>
  </svg>
);
export const MulheresIcon = (p) => (
  <svg viewBox="0 0 24 24" {...common} {...p}>
    <circle cx="12" cy="9" r="6"></circle><line x1="12" y1="15" x2="12" y2="22"></line><line x1="9" y1="19" x2="15" y2="19"></line>
  </svg>
);
export const NovosIcon = (p) => (
  <svg viewBox="0 0 24 24" {...common} {...p}>
    <path d="M12 2v4"></path><path d="M12 18v4"></path><path d="M4.93 4.93l2.83 2.83"></path><path d="M16.24 16.24l2.83 2.83"></path>
    <path d="M2 12h4"></path><path d="M18 12h4"></path><path d="M4.93 19.07l2.83-2.83"></path><path d="M16.24 7.76l2.83-2.83"></path>
  </svg>
);
export const SemFamiliaIcon = (p) => (
  <svg viewBox="0 0 24 24" {...common} {...p}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>
    <line x1="2" y1="2" x2="22" y2="22"></line>
  </svg>
);
