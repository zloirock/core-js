import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// optional-chain instance dispatch on SequenceExpression-receiver: `(fn(), arr)?.at(-1)`
// native semantics evaluate `fn()` BEFORE the nullish check (always once), then short-
// circuit on nullish or call `.at` on the resolved value. polyfill emit captures the
// whole SE in the guard memoize so fn() runs exactly once regardless of branch
let calls = 0;
const fn = () => {
  calls++;
};
const arr = [1, 2, 3];
const result = null == (_ref = (fn(), arr)) ? void 0 : _atMaybeArray(_ref).call(_ref, -1);
export { calls, result };