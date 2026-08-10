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
}();
export var a = _atMaybeArray(_ref);
export var {
  [(k++, 'at')]: _unused,
  other
} = _ref;
try {
  risky();
} catch (_ref2) {
  let at = _at(_ref2);
  let {
    code = function () {
      var concat = _concatMaybeArray(src);
      return concat;
    }
  } = _ref2;
  use(at, code);
}