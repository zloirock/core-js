import _Reflect$apply from "@core-js/pure/actual/reflect/apply";
// The pure Reflect namespace binding invokes through its `apply` member exactly as the entry does,
// so the write through the returned slot pairs with the constructor and its later read stays native.
import Reflect from '@core-js/pure/actual/reflect';
function pick(value) {
  return {
    value
  };
}
_Reflect$apply(pick, null, [Array]).value.from = patched;
export const result = Array.from([1]);