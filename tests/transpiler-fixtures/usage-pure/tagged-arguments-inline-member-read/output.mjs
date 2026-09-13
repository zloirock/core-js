import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// An inline tag receives the strings array before its Reflect argument.
// Its parameter reads only ownKeys; the namespace does not escape.
(function (strings, namespace) {
  return _Reflect$ownKeys({
    value: 1
  });
})`${_Reflect}`;