// a fallback branch that is an ALIAS to a branching value: the union follows the safe
// indirection and flattens the aliased branches, so both inner targets inject alongside
// the direct branch
const inner = c2 ? Array : Iterator;
export const { from } = c1 ? inner : Set;

// a DOUBLE-hop alias leaf still flattens: the branching value sits two safe hops away
const a2 = c3 ? Array : Set;
const b2 = c2 ? a2 : Iterator;
export const { of } = c4 ? b2 : Map;

// mutually-referencing branching aliases terminate via the shared seen-guard; the
// non-cyclic legs still contribute
const cx = c5 ? cy : Array;
const cy = c6 ? cx : Map;
export const { fromAsync } = c7 ? cx : Set;
