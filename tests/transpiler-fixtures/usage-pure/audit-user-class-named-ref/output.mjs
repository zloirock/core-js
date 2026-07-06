import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _at from "@core-js/pure/actual/instance/at";
var _ref2;
// User-declared `class _ref` reserves the bare slot. Plugin must shift
// to `_ref2` when allocating its own ref. Distinct from var/let path
// because class binding lives in lexical scope (kind: 'let')
class _ref {
  static fromList(xs) {
    return _findLastIndexMaybeArray(xs).call(xs, x => x > 0);
  }
}
const arr = [1, 2, 3];
_at(_ref2 = getList()).call(_ref2, 0);
_flatMapMaybeArray(arr).call(arr, x => [x]);
_ref.fromList(arr);