import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// All tag invocations supply Reflect after the strings array.
// The parameter reads only ownKeys, so the other namespace methods stay absent.
function tag(strings, namespace) {
  return _Reflect$ownKeys({
    value: 1
  });
}
tag`${_Reflect}`;