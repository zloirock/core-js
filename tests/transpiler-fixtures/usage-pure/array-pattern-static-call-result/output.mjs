import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$keys from "@core-js/pure/actual/object/keys";
var _ref, _ref2;
// Array patterns preserve a selected static method's known result type.
// The source prefix runs before binding, and repeated loop elements select the same static.
const [{
  from: make
}] = (effect(), [{
  from: _Array$from
}]);
export const first = _atMaybeArray(_ref = make([1])).call(_ref, 0);
let keys;
[{
  keys
}] = [{
  keys: _Object$keys
}];
export const second = _includesMaybeArray(_ref2 = keys({
  a: 1
})).call(_ref2, 'a');
for (const [{
  of: wrap
}] of [[{
  of: _Array$of
}], [{
  of: _Array$of
}]]) {
  var _ref3;
  consume(_mapMaybeArray(_ref3 = wrap(2)).call(_ref3, value => value + 1));
}