import _Array$from from "@core-js/pure/actual/array/from";
// `deferSideEffect` lifts the SE init as a standalone statement and `trimSideEffectTail`
// drops the no-op tail (the destructure target is gone after extraction). pre-fix the trim
// only inspected the top-level SequenceExpression - nested SE `(x++, (y++, Array))` left
// a useless `Array` read in the lifted statement (`x++, y++, Array;`) because the outer
// trim stopped at the inner SE (which itself has side effects from `y++`). post-fix
// `flattenSequence` recursively flattens nested SE before the trim, so the trailing
// no-op identifier strips correctly: `x++, y++;` (no dangling `Array`)
(x++, (y++, Array));
var from = _Array$from;
from([1]);