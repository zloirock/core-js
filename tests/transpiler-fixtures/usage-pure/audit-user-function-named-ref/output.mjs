import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _at from "@core-js/pure/actual/instance/at";
var _ref2;
// User-declared `function _ref` shadows plugin's slot 1. Plugin allocator
// must consult scope binding (babel) / collected binding names (unplugin)
// and pick `_ref2` instead. Test verifies bare-slot shadow path
function _ref(x) {
  return _findMaybeArray(x).call(x, item => item > 0);
}
const arr = [1, 2, 3];
_at(_ref2 = getArr()).call(_ref2, 0);
_findLastMaybeArray(arr).call(arr, x => x > 0);
_ref(arr);