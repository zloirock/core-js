import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// a string exclude is raw regex source, as documented: the escaped dots name `es.array.at`, so the
// array read stays native and the string read rewrites. the escaped spelling was once read as an
// entry path that matched no polyfill
[1].at(0);
_atMaybeString(_ref = 'str').call(_ref, -1);