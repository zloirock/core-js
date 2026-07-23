// a global alias bound by a LITERAL container names the same proxy global a bare alias does on EVERY
// surface that resolves a proxy-global root, not only an `extends` clause: a static member call and a
// well-known-symbol read both go through it. containers also chain, one hop feeding the next.
// the resolution negatives live in the usage-pure sibling, where substitution makes them observable.
// distinct method per line.
const [arrayWrap] = [globalThis];
const { k: objectWrap } = { k: globalThis };
const [hop1] = [globalThis];
const [hop2] = [hop1];
export const r1 = arrayWrap.Array.from([1]);
export const r2 = objectWrap.Symbol.iterator;
export const r3 = hop2.Array.of(2);
