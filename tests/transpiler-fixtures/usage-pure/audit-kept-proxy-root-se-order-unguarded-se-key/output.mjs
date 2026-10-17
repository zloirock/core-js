import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _globalThis from "@core-js/pure/actual/global-this";
// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let x;
let c = 0;
export { c };
// the UNGUARDED twin of the SE-bearing hop key: no guard, so the key evaluates right after the assignment
// in the native order - the migrated key preserves exactly that (assignment, key effect, read), where a
// pre-root harvest would have run the effect before the assignment
let u;
export const unguardedSeKey = _flatMapMaybeArray((u = _globalThis.window)[c++, "Array"].prototype).call([2], x => [x]);