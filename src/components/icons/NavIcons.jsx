// Icones de navegacao/acao (stroke, 18x18) — equivalentes ao antigo objeto ICON_SVG.
const common = { fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };

export const DashboardIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect>
    <rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect>
  </svg>
);
export const TabelaIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="3" y1="10" x2="21" y2="10"></line><line x1="9" y1="10" x2="9" y2="20"></line>
  </svg>
);
export const MinisteriosIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);
export const AgendamentosIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);
export const FamiliasIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <path d="M18 21a8 8 0 0 0-16 0"></path><circle cx="10" cy="8" r="5"></circle>
    <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"></path>
  </svg>
);
export const ImpressaoIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </svg>
);
export const LogoutIcon = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...common} {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);
export const ToggleIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);
export const ChevronIcon = (p) => (
  <svg viewBox="0 0 24 24" width="14" height="14" {...common} {...p}><polyline points="6 9 12 15 18 9"></polyline></svg>
);
export const ChevronLeftIcon = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...common} {...p}><polyline points="15 18 9 12 15 6"></polyline></svg>
);
export const ChevronRightIcon = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...common} {...p}><polyline points="9 18 15 12 9 6"></polyline></svg>
);
export const PinIcon = (p) => (
  <svg viewBox="0 0 24 24" width="14" height="14" {...common} {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>
  </svg>
);
export const MailIcon = (p) => (
  <svg viewBox="0 0 24 24" width="13" height="13" {...common} {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);
export const PhoneIcon = (p) => (
  <svg viewBox="0 0 24 24" width="13" height="13" {...common} {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);
export const PencilIcon = (p) => (
  <svg viewBox="0 0 24 24" width="15" height="15" {...common} {...p}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
  </svg>
);
export const TrashIcon = (p) => (
  <svg viewBox="0 0 24 24" width="15" height="15" {...common} {...p}>
    <path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);
export const SearchIcon = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...common} {...p}>
    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
export const DotsIcon = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...p}>
    <circle cx="12" cy="5" r="1.6"></circle><circle cx="12" cy="12" r="1.6"></circle><circle cx="12" cy="19" r="1.6"></circle>
  </svg>
);
export const CalendarIcon = (p) => (
  <svg viewBox="0 0 24 24" width="15" height="15" {...common} {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);
export const UsersIcon = (p) => (
  <svg viewBox="0 0 24 24" width="15" height="15" {...common} {...p}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);
export const UserPlusIcon = (p) => (
  <svg viewBox="0 0 24 24" width="15" height="15" {...common} {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle>
    <line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line>
  </svg>
);
