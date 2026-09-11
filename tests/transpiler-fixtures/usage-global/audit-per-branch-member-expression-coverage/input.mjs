// per-branch dispatch when fallback receivers are member accesses, not bare identifiers.
// The resolver accepts proxy-global member chains; the per-branch enumerator peels paren
// wrappers and accepts member-access branches so each branch's deps emit independently
// and every alternative contributes its polyfill to the file-level imports
const { from: a } = cond ? globalThis.Array : globalThis.Iterator;
const { from: b } = userFn() || globalThis.Array;
const { of: c } = cond ? Iterator : globalThis.Array;
export { a, b, c };
