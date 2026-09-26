import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref4, _ref5, _ref6;
// Nested computed keys retain their native reads after the array initializer.
// The selected Array and String receivers keep their specific instance polyfills.
const [_ref] = [{
  items: [2, 7]
}];
const _ref3 = _ref;
const {
  [(mark(), 'items')]: _ref2
} = null == _ref3 ? _ref3[""] : _ref3;
const at = _atMaybeArray(_ref2);
let includes;
[_ref4] = [{
  text: 'abc'
}];
_ref5 = _ref4;
({
  [(mark(), 'text')]: _ref6
} = null == _ref5 ? _ref5[""] : _ref5);
includes = _includesMaybeString(_ref6);
const [_ref7] = [{
  items: [2, 7]
}];
const _ref9 = _ref7;
const {
  [(mark(), 'items')]: _ref8
} = null == _ref9 ? _ref9[""] : _ref9;
const values = _valuesMaybeArray(_ref8);
export { values };
use(at, includes);