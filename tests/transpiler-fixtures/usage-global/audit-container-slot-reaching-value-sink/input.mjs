// An escaped slot keeps its original static candidate and may also hold an instance.
const ce = { e: Object };
export function sink(x) { return x; }
sink(ce);
const { e: { entries: escapedLiteralOnly } } = ce;
export { escapedLiteralOnly };
