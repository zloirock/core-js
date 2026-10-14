import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol from "@core-js/pure/actual/symbol";
var _ref;
// A `delete` reads every member below its target on the way there, so those keep their claims: an
// instance method the target hangs off dispatches, on the deepest backed hop whatever the root, and
// a constructor read on the way takes its ponyfill. The target itself is never read: a method it
// names stays native, deleted off the native prototype.
let n = 0;
function dhRoot() {
  return _globalThis;
}
export const protoMethodTarget = delete _globalThis.Array?.prototype.at;
export const protoMethodPlain = delete _globalThis.Array.prototype.includes;
export const seqRootMethodTarget = delete (n++, _globalThis).Array?.prototype.copyWithin;
export const deletedInstanceMember = delete _flatMaybeArray(_self.Array.prototype).name;
export const instanceTailMemo = null == (_ref = _self.Array) ? true : delete _flatMapMaybeArray(_ref.prototype).name;
export const callRootDispatchTail = delete _findLastMaybeArray(_self.Array.prototype).customQ;
// ... while a target off the same call root is the realm slot itself, reached off the root
export const callRootRunSlot = delete _globalThis.customQ;
export const claimAboveSeqNav = delete (n++, _Symbol).iterator;
export const deletedProto = delete _Map.prototype.noSuchMethod;
export const deletedProtoNav = null == _globalThis.window ? true : delete _Set.prototype.noSuchMethod;