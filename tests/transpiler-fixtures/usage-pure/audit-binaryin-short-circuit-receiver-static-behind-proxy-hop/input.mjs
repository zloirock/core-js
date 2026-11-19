// the STATIC host asks the same nullish question: a proxy hop that can short-circuit hands `in` the
// undefined it throws on, so the constant cannot simply replace the test there either. the controls
// below keep the static fold reachable - a bare global host is never nullish
export const staticBehindProxyHop = 'from' in globalThis.window?.Array;
