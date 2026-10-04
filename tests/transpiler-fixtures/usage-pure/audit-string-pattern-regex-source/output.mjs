import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// a string `include` is raw regex source, as documented: `es\.(array|string)\.at` names the two
// modules with an escaped dot and an alternation. the entries map decides what is an entry path;
// a string it does not resolve is a module pattern, however entry-like or dotted it looks
_atMaybeString('str').call('str', -1);
_atMaybeArray(_ref = [1]).call(_ref, 0);