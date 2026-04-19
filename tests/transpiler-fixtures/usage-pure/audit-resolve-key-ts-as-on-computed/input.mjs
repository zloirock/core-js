// TS `as` wrapper on computed key reaches resolveKey via the `in` path. previous A1-01
// fixture covered member-access; this covers the BinaryExpression-in entry
const k = Symbol.iterator;
const hasIter = ((k) as any) in {};
hasIter;
