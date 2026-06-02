import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// a getter property in an object-literal call-arg (`{ get k() { return [...] } }`) contributes its
// RETURN type to `T['k']`, not a Function value: `r` is `number[]`, so `.at` narrows to the array
// variant. classifying the getter as a method shorthand would resolve `T['k']` to Function and drop it
function get<T extends {
  k: unknown;
}>(o: T): T["k"] {
  return o.k;
}
const r = get({
  get k() {
    return [1, 2, 3];
  }
});
_atMaybeArray(r).call(r, 0);