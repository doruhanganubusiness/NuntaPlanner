/** Paginile secțiunii „Pentru miri" — pagina umbrelă + o subpagină per TAB.
 * Modul de date simplu (fără „use client") ca să poată fi folosit și în Server
 * Components (footer/site-nav), nu doar în componenta client de navigație. */
export const PENTRU_MIRI_PAGES = [
  { href: "/pentru-miri", label: "Prezentare" },
  { href: "/pentru-miri/panou-general", label: "Panou general" },
  { href: "/pentru-miri/detalii", label: "Detalii" },
  { href: "/pentru-miri/evenimente", label: "Evenimente" },
  { href: "/pentru-miri/buget", label: "Buget" },
  { href: "/pentru-miri/plan", label: "Plan" },
  { href: "/pentru-miri/invitatie", label: "Invitație" },
  { href: "/pentru-miri/membri", label: "Membri" },
] as const;
