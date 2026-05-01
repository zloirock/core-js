import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// `_ref100` is a valid plugin-emittable shape per ORPHAN_REF_PATTERN
// (`[1-9]\d+` matches 10+). User code declaring `_ref100` reserves the
// name through scope.hasBinding (babel) / collectAllBindingNames (unplugin);
// plugin-allocated `_ref` lands on bare slot regardless of how high
// user-declared suffix climbs
let _ref100 = "user";
const arr = [1, 2, 3];
_atMaybeArray(arr).call(arr, 0);
_findLastMaybeArray(arr).call(arr, x => x > 0);
console.log(_ref100);