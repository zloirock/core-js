import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
var _ref, _ref2;
// nested-proxy flatten in declarator [0] runs DURING traverse (skip-marking +
// pure-import inject); sibling declarator [1] holds an instance-method polyfill on
// a SequenceExpression init (scope-tracker queues `var _ref;` inside the preserved
// declarator's range during the sibling subtree visit). flushPendingFlatten in
// applyDestructuringTransforms must consume those splices via consumeRefBindingsInRange
// before the overwrite is queued, otherwise MagicString chunk-split throws on the
// nested edit. distinct methods (Array.from / Array.of / [].at / [].findLast)
// surface per-statement dispatch
let from = _Array$from;
let x = (sideEffect(), _atMaybeArray(_ref = (sideEffect(), [1, 2, 3])).call(_ref, -1));
let of = _Array$of;
let y = (sideEffect(), _findLastMaybeArray(_ref2 = (sideEffect(), [4, 5, 6])).call(_ref2, v => v > 0));
export { from, x, of, y };