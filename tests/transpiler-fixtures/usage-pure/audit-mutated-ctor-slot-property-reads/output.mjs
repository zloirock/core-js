import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// property reads THROUGH a slot-mutated ctor resolve to the replacement, not to pure
// statics: the slot holds the user's shim, so every static behind it is the shim's own
_globalThis.Promise = function ShimPromise() {};
// flat static call through the slot stays raw
_globalThis.Promise.resolve(1);
// destructured statics off the slot member stay raw
const {
  all
} = _globalThis.Promise;
export const a = all;
// a cross-alias slot write owns the nested ctor destructure the same way
_self.Map = function ShimMap() {};
const {
  groupBy
} = _globalThis.Map;
export const g = groupBy;
// the optional-chain guard over the slot member SURVIVES - after a delete the native
// chain short-circuits where a substituted always-defined static would not
delete _self.WeakSet;
export const r = _globalThis.WeakSet?.of;
// a property in-check through the slot stays dynamic
export const has = 'try' in _globalThis.Promise;
// a binding-alias later static read stays raw - the local holds the shim
_globalThis.Array = function FakeArray() {};
const {
  Array: A
} = _globalThis;
export const x = A.from([1]);
// a symbol-iterator extraction keeps the RAW slot member as the synth receiver
const it = _getIteratorMethod(_globalThis.Map);
export default it;