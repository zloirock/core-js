// an escaped container bails via the wildcard too
const ce = { e: Object };
export function sink(x) { return x; }
sink(ce);
const { e: { entries: escapedLiteralOnly } } = ce;
export { escapedLiteralOnly };
