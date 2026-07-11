// property reads THROUGH a slot-mutated ctor resolve to the replacement, not to pure
// statics: the slot holds the user's shim, so every static behind it is the shim's own
globalThis.Promise = function ShimPromise() {};
// flat static call through the slot stays raw
globalThis.Promise.resolve(1);
// destructured statics off the slot member stay raw
const { all } = globalThis.Promise;
export const a = all;
// a cross-alias slot write owns the nested ctor destructure the same way
self.Map = function ShimMap() {};
const { Map: { groupBy } } = globalThis;
export const g = groupBy;
// the optional-chain guard over the slot member SURVIVES - after a delete the native
// chain short-circuits where a substituted always-defined static would not
delete self.WeakSet;
export const r = globalThis.WeakSet?.of;
// a property in-check through the slot stays dynamic
export const has = 'try' in globalThis.Promise;
// a binding-alias later static read stays raw - the local holds the shim
globalThis.Array = function FakeArray() {};
const { Array: A } = globalThis;
export const x = A.from([1]);
// a symbol-iterator extraction keeps the RAW slot member as the synth receiver
const { [Symbol.iterator]: it } = globalThis.Map;
export default it;
