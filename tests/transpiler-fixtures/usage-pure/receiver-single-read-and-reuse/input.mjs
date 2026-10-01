// A receiver read once by an instance helper stays inline, even when a folded realm hop
// carries a root effect. A later key effect still needs its receiver captured before it;
// calls binding this and optional accesses keep the memo their second receiver read needs.
// usage-global has no receiver rendering, so no import-set twin can distinguish this claim.
let seq = 0;
export const plainRead = (seq++, globalThis)?.window.Array.name;
export const simpleCall = (seq++, globalThis)?.window.Array.prototype[Symbol.iterator]();
const box = { get list() { seq++; return [1, 2]; } };
export const keyedRead = box.list[(seq++, 'at')];
export const methodCall = box.list.includes(2);
export const guardedRead = box.list?.findLast;
export { seq };
