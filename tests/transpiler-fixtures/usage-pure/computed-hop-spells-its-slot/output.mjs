import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A bracketed hop key selects the same slot as its dotted spelling, including constant aliases
// and literal or array-wrapped receivers. An effectful key runs once before the selected slot
// is read by an instance leaf, while the leaf keeps the correct constructor-family narrowing.
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
  [(eff(1), 'Array')]: _ref
} = null == _globalThis ? _globalThis[""] : _globalThis;
const values = _valuesMaybeArray(_ref.prototype);
const {
  [(eff(2), 'Array')]: {
    of
  }
} = {
  Array: {
    of: _Array$of
  }
};
use(at, includes, forEach, map, values, of);