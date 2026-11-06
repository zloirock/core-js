// A named callee that returns its parameter inside a container literal yields that container per
// call, so a static read through the slot lands on the argument and takes the pure static.
// The call keeps running ahead of the read wherever the callee is not provably effect-free.
const log = [];
function box(v) { return [v]; }
function wrap(s, v) { log.push(s); return { held: v }; }
const held = box(Array);
export const direct = box(Array)[0].of(1);
export const stored = held[0].from([1]);
export const inline = (function (v) { return { at: v }; })(Object).at.groupBy([1], x => x);
export const tagged = wrap`${ Map }`.held.groupBy([1], x => x);
