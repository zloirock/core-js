import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
// a TS cast wrapping the proxy-global tail of a side-effect prefix buried below a static
// (`(eff(), (globalThis.self as any)).Array.from`): the subsumption walk must peel BOTH the buried
// sequence AND the transparent TS cast to reach + mark the inner proxy leaf, else unplugin queues a
// parallel `globalThis.self -> _globalThis` rewrite the static collapse cannot compose -> crash. an
// IIFE root behind the cast (`((() => globalThis)() as any).self`) takes the same peel-then-mark path
let eff = () => 0;
const obj = {};
export const a = (eff(), _Array$from)([1, 2]);
export const b = _getIteratorMethod(obj);
export const c = _Number$MAX_SAFE_INTEGER;