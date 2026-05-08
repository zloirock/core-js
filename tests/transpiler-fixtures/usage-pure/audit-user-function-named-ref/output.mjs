import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// User-declared `function _ref` shadows plugin's slot 1. Plugin allocator
// must consult scope binding (babel) / collectAllBindingNames (unplugin)
// and pick `_ref2` instead. Test verifies bare-slot shadow path
function _ref(x) {
  return _findMaybeArray(x).call(x, item => item > 0);
}
const arr = [1, 2, 3];
_atMaybeArray(arr).call(arr, 0);
_findLastMaybeArray(arr).call(arr, x => x > 0);
_ref(arr);