// a proxy-global FLATTEN declarator (`{ Array: { from } } = globalThis`) claims the declaration, and a
// SIBLING nested-instance extraction in the same declaration binds as a trailing declarator appended into
// the flatten's render. the cloned receiver carries a FUNCTION value whose body references a polyfillable
// global - it must substitute in the trailing copy AND the kept residual (visitor-driven), not left raw.
const { Array: { from } } = globalThis, { y: { at: m } } = { y: [() => Map] };
export const r = [from, m];
