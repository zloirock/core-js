import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Reflect$set from "@core-js/pure/actual/reflect/set";
var _ref, _ref2;
enum Key {
  First
}
_Reflect$set(Key, 0, [7]);
export const first = _atMaybeArray(_ref = Key[Key.First]).call(_ref, 0);
namespace Namespace {
  export enum Status {
    Ready
  }
}
const {
  Status: saved
} = Namespace;
_Reflect$set(saved, 0, ['updated']);
export const selected = _includesMaybeArray(_ref2 = Namespace.Status[0]).call(_ref2, 'updated');