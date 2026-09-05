import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _globalThis from "@core-js/pure/actual/global-this";
// a hop key written in brackets names the same slot its dotted spelling does, so a claim under it
// rides the same route: the built-in surface narrows to the constructor's own family, a const-bound
// key resolves like the literal, a literal receiver descends through it, and the array-WRAPPED host
// descends its slot to the same surface. a key that only folds through a SEQUENCE keeps its slot -
// consuming the prop would drop the effect the key evaluates, and the module its claim needs is
// still the one usage-global injects
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
const {
  [(eff(1), 'Array')]: {
    prototype: {
      values
    }
  }
} = _globalThis;
const {
  [(eff(2), 'Array')]: {
    of
  }
} = _globalThis;
use(at, includes, forEach, map, values, of);