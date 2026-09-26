import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2;
// a string `include` is raw regex source, as documented: `es\.(array|string)\.at` names the two
// modules with an escaped dot and an alternation. the entries map decides what is an entry path;
// a string it does not resolve is a module pattern, however entry-like or dotted it looks
_atMaybeString(_ref = 'str').call(_ref, -1);
_atMaybeArray(_ref2 = [1]).call(_ref2, 0);