// truthy guard `if (r)` body: `r: number[] | null` declared union. polyfill provider
// resolves r's annotation; the union fold strips the null branch (non-viable), narrows to
// Array. distinct methods on narrow result: `_atMaybeArray` / `_includesMaybeArray` (Array
// hint preserved through fold). without strip: union remains, generic dispatch
declare const r: number[] | null;
if (r) {
  r.at(0);
  r.includes(1);
}
