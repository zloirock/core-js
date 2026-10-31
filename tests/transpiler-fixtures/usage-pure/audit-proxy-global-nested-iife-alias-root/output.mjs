import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// nested zero-arg IIFEs around a proxy-global alias root (`const g = (() => (() => globalThis)())()`)
// peel to a fixpoint, so `g` still names the global surface and `g.Array.from` collapses to the pure
// static - a single-level peel would stop at the inner IIFE call and leave the read native
const g = (() => (() => _globalThis)())();
_Array$from([1, 2, 3]);