import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// Each invocation reads its own argument through the assigned function.
// The array call uses at; the string call uses includes.
const box = {};
box.fn = value => value;
use(_atMaybeArray(_ref = box.fn([8, 9])).call(_ref, -1));
use(_includesMaybeString(_ref2 = box.fn("abcd")).call(_ref2, "bc"));