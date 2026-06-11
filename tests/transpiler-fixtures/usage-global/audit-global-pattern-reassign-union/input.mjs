// pattern-LHS reassignments flow their slot values into the usage-global union: the receiver
// resolves the reaching Iterator (dead Array init dropped by the dominating write) and the
// computed key resolves the reaching slot string, each injecting its method entry
let A = Array;
[A] = [Iterator];
export const r1 = A.from(y);
let K = 'from';
[K] = ['of'];
export const r2 = Array[K](1);
// a hole shifts the pairing but the slot still pairs positionally
let O = Array;
[, O] = [x, Object];
export const r3 = O.groupBy(items, fn);
// a slot DEFAULT is a reachable value too (it applies on an undefined slot)
let F = Array;
[F = Object] = [maybe];
export const r4 = F.fromEntries(entries);
// object-pattern slots pair by key
let P = Array;
({ p: P } = { p: Promise });
export const r5 = P.try(fn);
// logical assignment flows its RHS as a reachable value
let M = Array;
M ||= Map;
export const r6 = M.groupBy(items, fn);
