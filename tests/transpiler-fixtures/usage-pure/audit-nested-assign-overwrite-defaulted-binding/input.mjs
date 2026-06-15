// A nested instance-method destructure in an ASSIGNMENT has no declaration to host a `const`, so the
// polyfill is applied by appending `binding = _helper(receiver)` after the statement (native assigns
// undefined first on engines lacking the method, then this overwrite wins). The binding target must
// be read through the canonical predicate: a DEFAULTED binding (`m = []`) is an AssignmentPattern, so
// a raw `value.type === 'Identifier'` check would drop the overwrite. Distinct methods per line.
declare const a: number[];
declare const b: string[];
let m, n;
[{ flat: m = [] }] = [a];
[{ at: n = 0 }] = [b];
