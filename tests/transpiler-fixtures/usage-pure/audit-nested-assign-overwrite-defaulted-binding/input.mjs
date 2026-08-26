// a nested instance-method destructure in an ASSIGNMENT has no declaration to host a `const`, so the
// polyfill is applied by appending `binding = _helper(receiver)` after the statement (native assigns
// undefined first on engines lacking the method, then this overwrite wins). the binding target must
// be read through the canonical predicate: a DEFAULTED binding (`m = []`) is an AssignmentPattern, so
// a raw `value.type === 'Identifier'` check would drop the overwrite. distinct methods per line.
// the guard's FALLBACK follows the slot: a pruned one never ran the default, so the default NODE is
// spelled, while a slot that SURVIVES ran it exactly once and hands the guard its binding
declare const a: number[];
declare const b: string[];
declare const c: number[];
let m, n, o, other;
[{ flat: m = [] }] = [a];
[{ at: n = 0 }] = [b];
// a SIBLING element keeps the whole destructure - it still binds - so this slot ran its default
[{ findLast: o = null }, other] = [c, 1];
