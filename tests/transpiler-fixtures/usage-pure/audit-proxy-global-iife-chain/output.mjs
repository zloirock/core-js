import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// IIFE-returning proxy-global at the root of a receiver chain (`(() => globalThis).Array.from`).
// resolveProxyGlobalRoot inlines the call to reach the proxy-global identifier; markHandledObjects
// then marks the IIFE + inner `globalThis` so unplugin's text-emit doesn't queue a parallel
// `globalThis -> _globalThis` rewrite that would overlap the outer Array.from replacement
const out = _Array$from([1, 2, 3]);
_atMaybeArray(out).call(out, 0);