export function getPageTitle(pathname: string) {
  if (pathname === "/") {
    return "Tableau de bord";
  }

  if (pathname === "/clients/new") {
    return "Nouveau client";
  }

  if (pathname === "/invoices/new") {
    return "Nouvelle facture";
  }

  if (/^\/clients\/[^/]+\/edit$/.test(pathname)) {
    return "Modifier le client";
  }

  if (/^\/invoices\/[^/]+\/edit$/.test(pathname)) {
    return "Modifier la facture";
  }

  if (/^\/clients\/[^/]+$/.test(pathname)) {
    return "Client";
  }

  if (/^\/invoices\/[^/]+$/.test(pathname)) {
    return "Facture";
  }

  if (pathname.startsWith("/clients")) {
    return "Clients";
  }

  if (pathname.startsWith("/invoices")) {
    return "Factures";
  }

  return "Mon Cahier";
}

export function getBackHref(pathname: string) {
  if (pathname === "/clients/new") {
    return "/clients";
  }

  if (pathname === "/invoices/new") {
    return "/invoices";
  }

  const clientEdit = pathname.match(/^\/clients\/([^/]+)\/edit$/);
  if (clientEdit) {
    return `/clients/${clientEdit[1]}`;
  }

  const invoiceEdit = pathname.match(/^\/invoices\/([^/]+)\/edit$/);
  if (invoiceEdit) {
    return `/invoices/${invoiceEdit[1]}`;
  }

  if (/^\/clients\/[^/]+$/.test(pathname)) {
    return "/clients";
  }

  if (/^\/invoices\/[^/]+$/.test(pathname)) {
    return "/invoices";
  }

  return null;
}
