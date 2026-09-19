import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// All calls supply Reflect, and the parameter reads only ownKeys.
// Attribute that static without widening the namespace to its other methods.
function read(strings, namespace) {
  return _Reflect$ownKeys({
    value: 1
  });
}
read([""], _Reflect);