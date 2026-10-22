import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
import _startsWithMaybeString from "@core-js/pure/actual/string/instance/starts-with";
// Both declaration and assignment loop heads serve instance leaves below an array.
// The extracted assignment bindings remain available after the loop exits.
for (const _ref2 of [{
  w: [[1, [2]]]
}]) {
  const {
    w: [_ref]
  } = _ref2;
  const at = _atMaybeArray(_ref);
  const flat = _flatMaybeArray(_ref);
  use(at, flat);
}
let includes, startsWith;
for (const _ref4 of [{
  w: ['abc']
}]) {
  var _ref3;
  ({
    w: [_ref3]
  } = _ref4);
  includes = _includesMaybeString(_ref3);
  startsWith = _startsWithMaybeString(_ref3);
  break;
}
use(includes, startsWith);