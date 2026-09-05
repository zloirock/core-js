import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a hop key written in brackets names the same slot its dotted spelling does, so a claim under it
// rides the same route: the built-in surface narrows to the constructor's own family, a const-bound
// key resolves like the literal, a literal receiver descends through it, and the array-WRAPPED host
// descends its slot to the same surface. a key that only folds through a SEQUENCE keeps its level
// the way a rest sibling does - the hop retires to a sentinel that runs the key once - and the
// claims below extract off the slot the folded key names
const eff = t => t;
const at = _atMaybeArray(_globalThis.Array.prototype);
const K = 'Array';
const includes = _includesMaybeArray(_globalThis.Array.prototype);
const [{
  ['Array']: {
    prototype: {
      forEach
    }
  }
}] = [_globalThis];
const map = _mapMaybeArray([1]);
const values = _valuesMaybeArray(_globalThis.Array.prototype);
const {
  [(eff(1), 'Array')]: _unused
} = _globalThis;
const of = _Array$of;
const {
  [(eff(2), 'Array')]: _unused2
} = _globalThis;
use(at, includes, forEach, map, values, of);