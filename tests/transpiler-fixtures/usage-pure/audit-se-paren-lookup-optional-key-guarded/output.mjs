import _includes from "@core-js/pure/actual/instance/includes";
// A polyfilled instance method reached via a parenthesized OPTIONAL member with a side-effecting computed
// key. Native short-circuits `arr?.[...]` before evaluating the key, so the key effect must fire only on
// the non-null branch - the emitter folds it INTO the guard alternate, not onto the whole result (which
// would fire it even when `arr` is nullish and the chain short-circuits).
let probe = 0;
export function callViaParen(arr) {
  return (arr == null ? void 0 : (probe++, _includes(arr))).call(arr, 1);
}