import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
import _startsWithMaybeString from "@core-js/pure/actual/string/instance/starts-with";
var _ref6, _ref7, _ref8;
// A proven computed key stays native before the selected array is destructured.
// Its effect runs once after the initializer; exports expose only the source binding.
const key = 'items';
const {
  [key]: _ref
} = {
  items: [[2, 7]]
};
const [_ref2] = _ref;
const at = _atMaybeArray(_ref2);
const _ref4 = {
  items: ['abc']
};
const {
  [(mark(), 'items')]: _ref3
} = null == _ref4 ? _ref4[""] : _ref4;
const [_ref5] = _ref3;
const includes = _includesMaybeString(_ref5);
export { includes };
use(at);
let startsWith;
_ref6 = {
  items: ['abc']
};
({
  [(mark(), 'items')]: _ref7
} = null == _ref6 ? _ref6[""] : _ref6);
[_ref8] = _ref7;
startsWith = _startsWithMaybeString(_ref8);
use(startsWith);