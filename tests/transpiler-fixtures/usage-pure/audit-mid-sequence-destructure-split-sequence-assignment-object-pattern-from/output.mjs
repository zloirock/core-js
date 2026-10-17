import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A destructure assignment in ANY slot of a statement-position SequenceExpression is split into per-expression statements by the
// shared minifier-shape pre-pass (statement context discards every slot's value, so the split is sound at any position) - the
// emitter then polyfills the standalone statement.
let from;
from = _Array$from;
use();
export const r1 = _at(_ref = from([3])).call(_ref, 0);
// A value-position sequence keeps its tail value while a discarded assignment may be rewritten.
export const v = (from = _Array$from, from([5]));