import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
var _ref, _ref2;
// Array-wrapped statics stay native while their known result types inform later instance calls.
// The source prefix and loop iteration remain ahead of their property reads.
const [{
  from: make
}] = (effect(), [Array]);
export const first = _atMaybeArray(_ref = make([1])).call(_ref, 0);
let keys;
[{
  keys
}] = [Object];
export const second = _includesMaybeArray(_ref2 = keys({
  a: 1
})).call(_ref2, 'a');
for (const [{
  of: wrap
}] of [[Array], [Array]]) {
  var _ref3;
  consume(_mapMaybeArray(_ref3 = wrap(2)).call(_ref3, value => value + 1));
}