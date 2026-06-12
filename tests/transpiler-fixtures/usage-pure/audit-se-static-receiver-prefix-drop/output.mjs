import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// a static call through a SequenceExpression receiver keeps only the tail: dropped
// effect-free prefix operands (including polyfillable globals) are suppressed WHOLE -
// their own queued rewrites would have no needle left in the emitted text. SE-bearing
// prefix operands re-emit and keep their own polyfills
export const r1 = _Array$from(x);
export const r2 = (eff(), _Array$of)(y);
export const r3 = (_WeakSet, _Iterator, Array).isArray(z);
export const r4 = (_Iterator$from(seed), _Array$from)(w);