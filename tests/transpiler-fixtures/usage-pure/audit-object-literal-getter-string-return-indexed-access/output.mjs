import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// the getter's return type flows into `T['k']` PRECISELY: a getter returning a string makes `r` a
// string, so `.at` narrows to the STRING variant (not array). proves the getter resolves to its
// actual return type rather than a blanket array narrow - distinct from the array-returning getter
function get<T extends {
  k: unknown;
}>(o: T): T["k"] {
  return o.k;
}
const r = get({
  get k() {
    return "hi";
  }
});
_atMaybeString(r).call(r, 0);