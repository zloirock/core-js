import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// the DOMINATING reassignment's reaching value is a proxy-global wrapped in a side-effect sequence
// (`A = (eff(), self)`): the alias-root walk peels the wrapper to the tail (self, a proxy) exactly as
// the receiver / value paths do, so `A.Array.from` collapses to the pure static while the write's
// `eff()` side effect stays in place
let A = _globalThis;
A = (eff(), _self);
_Array$from([1, 2, 3]);