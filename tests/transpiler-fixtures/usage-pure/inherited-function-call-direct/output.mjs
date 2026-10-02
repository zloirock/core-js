import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// A closed literal uses the intrinsic inherited toString, whose result is a string.
const box = {};
use(_atMaybeString(_ref = box.toString()).call(_ref, -1));