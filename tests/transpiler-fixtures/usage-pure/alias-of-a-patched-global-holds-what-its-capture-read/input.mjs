// an alias of a patched global holds what its capture read: captured after a write of the slot it holds
// the user's value, so a detect through it keeps its fallback - after one write, a ternary detect, a
// chain of aliases, a function frame; captured ahead of every write it holds the pure import, which the
// detect folds to - an alias of that alias, past a write, too
globalThis.WeakSet = undefined;
const NativeWeakSet = WeakSet;
globalThis.WeakSet = NativeWeakSet || ShimWeakSet;
globalThis.Promise = undefined;
const NativePromise = Promise;
globalThis.Promise = typeof NativePromise == 'function' ? NativePromise : ShimPromise;
globalThis.Map = undefined;
const CapturedMap = Map;
const NativeMap = CapturedMap;
globalThis.Map = NativeMap || ShimMap;
export function installSet() {
  globalThis.Set = undefined;
  const NativeSet = Set;
  globalThis.Set = NativeSet || ShimSet;
}
const NativeWeakMap = WeakMap;
globalThis.WeakMap = NativeWeakMap || ShimWeakMap;
const EarlyReflect = Reflect;
globalThis.Reflect = undefined;
const NativeReflect = EarlyReflect;
globalThis.Reflect = NativeReflect || ShimReflect;
