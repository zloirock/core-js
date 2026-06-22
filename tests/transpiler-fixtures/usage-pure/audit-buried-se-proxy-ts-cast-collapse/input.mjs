// a TS cast wrapping the proxy-global tail of a side-effect prefix buried below a static
// (`(eff(), (globalThis.self as any)).Array.from`): the subsumption walk must peel BOTH the buried
// sequence AND the transparent TS cast to reach + mark the inner proxy leaf, else unplugin queues a
// parallel `globalThis.self -> _globalThis` rewrite the static collapse cannot compose -> crash. an
// IIFE root behind the cast (`((() => globalThis)() as any).self`) takes the same peel-then-mark path
let eff = () => 0;
const obj = {};
export const a = (eff(), (globalThis.self as any)).Array.from([1, 2]);
export const b = obj[(eff(), (globalThis.self as any)).Symbol.iterator];
export const c = (0, ((() => globalThis)() as any).self).Number.MAX_SAFE_INTEGER;
