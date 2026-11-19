// `Object.create(null)` yields a prototype-less object, so its member reads dispatch nothing a
// polyfill could serve - that verdict models the NATIVE static. once the slot is replaced the call
// returns whatever the replacement returns, so the receiver must stay unknown and keep the generic
// dispatch. the unreplaced call keeps its inert verdict, and a prototype argument keeps installing.
// distinct method per line
Object.create = shim;
const replaced = Object.create(null);
export const a = replaced.at(0);
