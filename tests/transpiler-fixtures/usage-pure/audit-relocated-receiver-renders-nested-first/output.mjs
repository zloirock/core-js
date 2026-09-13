import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// a phase that RELOCATES a range composes its text at once, so a destructure statement nested in
// that range must be rebuilt first - rebuilt afterwards it emits into text the relocation already
// carried away. both relocating hosts are here: a receiver memo over an IIFE receiver, and a catch
// param whose default runs its own destructure
let k = 0;
const src = [1, 2];
var _ref = function () {
    var flat = _flatMaybeArray(src);
    return [flat];
  }(),
  _ref2 = _ref,
  a = null == _ref2 ? _ref2[""] : (k++, _atMaybeArray(_ref2)),
  {
    other
  } = _ref;
export { a, other };
try {
  risky();
} catch (_ref3) {
  let at = _at(_ref3);
  let {
    code = function () {
      var concat = _concatMaybeArray(src);
      return concat;
    }
  } = _ref3;
  use(at, code);
}