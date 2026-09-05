import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a SELECTING receiver whose every branch names a global OBJECT reads one realm whichever branch
// runs, so the surface under it is the same on all of them and the claim narrows to the family that
// surface hosts. `&&` is not a selection of this kind - its left is the TEST and a falsy left is
// what the whole yields, so the read there stays native on both legs
const seen = [];
const pick = 1;
const at = _atMaybeArray(_globalThis.Array.prototype);
const includes = _includesMaybeArray(_self.Array.prototype);
const {
  Array: {
    prototype: {
      map
    }
  }
} = pick && _globalThis;
_pushMaybeArray(seen).call(seen, at, includes, map);
export { seen };