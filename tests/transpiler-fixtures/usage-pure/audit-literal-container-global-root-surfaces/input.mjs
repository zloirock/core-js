// the pure sibling: here the root is SUBSTITUTED when the container-bound alias resolves, so both
// directions are observable. a container that carries the global resolves and chains; a container
// carrying something else, and a slot whose position a leading spread shifted, have no single
// definite global value and must stay native. distinct method per line.
const [arrayWrap] = [globalThis];
const { k: objectWrap } = { k: globalThis };
const [hop1] = [globalThis];
const [hop2] = [hop1];
const [notGlobal] = [somethingElse];
const [shifted] = [...src, globalThis];
export const r1 = arrayWrap.Array.from([1]);
export const r2 = objectWrap.Symbol.iterator;
export const r3 = hop2.Array.of(2);
export const r4 = notGlobal.Array.isArray([]);
export const r5 = shifted.Map;
