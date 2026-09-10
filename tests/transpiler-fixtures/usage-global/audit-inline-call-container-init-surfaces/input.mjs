// a container bound by an inline CALL is the container that call RETURNS: the receiver walk peels it
// on its own hop, so every surface that resolves a proxy-global root reads it exactly as it reads a
// literal container - a static call, a `new`, an `extends` base and a well-known-symbol read.
// the callee spellings that do NOT peel live in the usage-pure sibling, where substitution shows them.
// distinct method per line.
const arrowWrap = (() => ({ realm: globalThis }))();
const fnWrap = (function () { return { realm: globalThis }; })();
function makeWrap() { return { realm: globalThis }; }
const declWrap = makeWrap();
export const r1 = arrowWrap.realm.Array.from([1]);
export const r2 = new fnWrap.realm.Map();
export const r3 = declWrap.realm.Symbol.iterator;
export class R4 extends arrowWrap.realm.Set {}
