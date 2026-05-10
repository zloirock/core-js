import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// truthy guard `if (r)` body: `r: number[] | null` declared union. polyfill provider
// resolves r's annotation; foldUnionTypes strips null branch (non-viable), narrows to
// Array. distinct methods on narrow result: `_atMaybeArray` / `_includesMaybeArray` (Array
// hint preserved through fold). without strip: union remains, generic dispatch
declare const r: number[] | null;
if (r) {
  _atMaybeArray(r).call(r, 0);
  _includesMaybeArray(r).call(r, 1);
}