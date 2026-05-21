import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// nested IIFE: outer IIFE returns inner IIFE call, inner returns proxy-global.
// `isProxyGlobalIifeReturn` recurses through the inner call via the IIFE branch, validating
// that `peelIIFEReturn` + the recursive `isGlobalProxy` walk bottom out correctly
const out = _Array$from([1, 2, 3]);
_atMaybeArray(out).call(out, 0);