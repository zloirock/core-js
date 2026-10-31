import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref3, _ref4;
// Nested computed keys retain their native reads after the array initializer.
// The selected Array and String receivers keep their specific instance polyfills.
const [_ref] = [{
  items: [2, 7]
}];
const {
  [(mark(), 'items')]: _ref2
} = null == _ref ? _ref[""] : _ref;
const at = _atMaybeArray(_ref2);
let includes;
[_ref3] = [{
  text: 'abc'
}];
({
  [(mark(), 'text')]: _ref4
} = null == _ref3 ? _ref3[""] : _ref3);
includes = _includesMaybeString(_ref4);
const [_ref5] = [{
  items: [2, 7]
}];
const {
  [(mark(), 'items')]: _ref6
} = null == _ref5 ? _ref5[""] : _ref5;
const values = _valuesMaybeArray(_ref6);
export { values };
use(at, includes);