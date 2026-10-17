// The sequence prefix ahead of a claimed static is re-emitted VERBATIM, so what it reads keeps its own rewrite: a bare proxy
// global there must still come back polyfilled, not raw.
export const prefixGlobal = (globalThis, globalThis.self).Map.name;
