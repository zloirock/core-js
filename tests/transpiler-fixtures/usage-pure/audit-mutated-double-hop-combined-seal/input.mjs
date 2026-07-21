// a MUTATED static behind a double proxy-hop optional chain: the mutation cancels the
// always-defined claim the proxy-prefix deopt leans on, so the `?.` must keep its guard and
// the memo must bind the chain ROOT (the one value that can be undefined) - the sealed
// emit `((n = w)?.Array).of(1)` threw where native short-circuits, and a nav-level memo
// self-collapsed into an always-defined ponyfill (guard never fired, silent wrong value)
globalThis.Array.of = function patched() {
  return [7];
};
globalThis.Set = class PatchedSet extends Set {};
let n;
export const doubleHop = (n = globalThis.window)?.self?.self.Array.of(1).flat?.();
let p;
let sc = 0;
export const sePrefixRoot = (sc++, p = globalThis.window)?.self?.self.Array.of(1).flat?.();
let m, q;
export const nestedAssign = (m = q = globalThis.window)?.self?.self.Array.of(1).flat?.();
let e;
export const earlyArmOptionalCall = (e = globalThis.window)?.self?.self.Array?.of(1);
let v;
export const mutatedNameTail = (v = globalThis.window)?.self?.self.Set.name.at?.(0);
// single-hop spelling of the same family (the previously locked canon holds)
let s;
export const singleHop = (s = globalThis.window)?.self.Array.of(1).flat?.();
// an always-defined root keeps the deopt even under the mutated landing: the raw read
// hangs off a defined object and cannot throw, so the dead guard stays dropped
let d;
export const resolvableRoot = (d = globalThis)?.self?.self.Array.of(1).flat?.();
// an ALIAS value resolves through the same family walk: the aliased `window` is exactly as
// undefinable as the spelled-out nav, so the guard survives here too
const w = globalThis.window;
let a;
export const aliasValueRoot = (a = w)?.self?.self.Array.of(1).flat?.();
// a mutated CONSTRUCTOR slot cancels the claim the same way a mutated static does
let c;
export const mutatedCtorSlot = (c = globalThis.window)?.self?.self.Set.name.at?.(0);
// a NON-mutated polyfillable builtin in the same nav shape: nothing cancels the claim, so the
// leaf routes through its ponyfill while the guard still binds the undefinable root
let nm;
export const nonMutatedStatic = (nm = globalThis.window)?.self?.self.Map.groupBy([1], x => x);
