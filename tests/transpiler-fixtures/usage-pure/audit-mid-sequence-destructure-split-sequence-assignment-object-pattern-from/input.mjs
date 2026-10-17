// A destructure assignment in ANY slot of a statement-position SequenceExpression is split into per-expression statements by the
// shared minifier-shape pre-pass (statement context discards every slot's value, so the split is sound at any position) - the
// emitter then polyfills the standalone statement.
let from;
(({ from } = Array), use());
export const r1 = from([3]).at(0);
// A value-position sequence keeps its tail value while a discarded assignment may be rewritten.
export const v = (({ from } = Array), from([5]));
