import _globalThis from "@core-js/pure/actual/global-this";
import _Reflect from "@core-js/pure/actual/reflect";
import _WeakMap from "@core-js/pure/actual/weak-map";
// an alias of a patched global holds what its capture read: captured after a write of the slot it holds
// the user's value, so a detect through it keeps its fallback - after one write, a ternary detect, a
// chain of aliases, a function frame; captured ahead of every write it holds the pure import, which the
// detect folds to - an alias of that alias, past a write, too
_globalThis.WeakSet = undefined;
const NativeWeakSet = WeakSet;
_globalThis.WeakSet = NativeWeakSet || ShimWeakSet;
_globalThis.Promise = undefined;
const NativePromise = Promise;
_globalThis.Promise = typeof NativePromise == 'function' ? NativePromise : ShimPromise;
_globalThis.Map = undefined;
const CapturedMap = Map;
const NativeMap = CapturedMap;
_globalThis.Map = NativeMap || ShimMap;
export function installSet() {
  _globalThis.Set = undefined;
  const NativeSet = Set;
  _globalThis.Set = NativeSet || ShimSet;
}
const NativeWeakMap = _WeakMap;
_globalThis.WeakMap = NativeWeakMap;
const EarlyReflect = _Reflect;
_globalThis.Reflect = undefined;
const NativeReflect = EarlyReflect;
_globalThis.Reflect = NativeReflect;