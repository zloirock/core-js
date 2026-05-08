import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _at from "@core-js/pure/actual/instance/at";
// Identifier reference suppressed by a `core-js-disable-next-line` directive.
// Post-sweep walks Identifiers in usage-pure mode; the `shouldSkipPath` predicate
// checks `disabledLines` so the directive still applies after the primary pass.
const v = _at(arr).call(arr, 0);
// core-js-disable-next-line
const fresh = Map;
const back = _findLastIndexMaybeArray(arr).call(arr, x => x === v);
export { v, fresh, back };