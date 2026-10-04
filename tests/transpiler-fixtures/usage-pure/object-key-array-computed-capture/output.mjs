import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
import _startsWithMaybeString from "@core-js/pure/actual/string/instance/starts-with";
var _ref3;
// A proven computed key stays native before the selected array is destructured.
// Its effect runs once after the initializer; exports expose only the source binding.
const key = 'items';
const {
  [key]: [_ref]
} = {
  items: [[2, 7]]
};
const at = _atMaybeArray(_ref);
const {
  [(mark(), 'items')]: [_ref2]
} = {
  items: ['abc']
};
const includes = _includesMaybeString(_ref2);
export { includes };
use(at);
let startsWith;
({
  [(mark(), 'items')]: [_ref3]
} = {
  items: ['abc']
});
startsWith = _startsWithMaybeString(_ref3);
use(startsWith);