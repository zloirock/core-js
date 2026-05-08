// IIFE body conditionally throws before the tail return. ThrowStatement may unwind the
// call before the tail; receiver chain after the throw is unreachable but the return
// itself is. `singleReturnBodyExpression` bails on ThrowStatement (caller's emit would
// silently drop the throw, changing observable runtime behavior  -  ReferenceError vs
// silent value)
const out = (() => { if (cond) throw new Error('fail'); return Set; })().of(1);
export { out };
