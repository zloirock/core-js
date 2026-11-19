// a synth-swap receiver with SE buried along its member spine re-emits the receiver ahead
// of the literal (rescue): the effect keeps running, the proxy root substitutes inside the
// re-emitted text, and the literal alone (which once replaced the receiver outright) no
// longer drops the effect. an effect-free receiver keeps the bare literal - no extra read
export function f({ from } = (eff(), globalThis).Array) { return from; }
export function g({ of: o2 } = globalThis.Array) { return o2; }
export function h({ keys } = cond ? (eff2(), globalThis).Object : Object) { return keys; }
// multiple buried effects keep source order; an assignment-form host harvests the same way
export function k({ entries } = (a(), b(), globalThis).Object) { return entries; }
let from2;
({ from: from2 } = (eff3(), globalThis).Array);
export const r = from2;
