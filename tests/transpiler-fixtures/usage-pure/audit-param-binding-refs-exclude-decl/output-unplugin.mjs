import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A function param's own declaration slot is NOT a reference: when a param reassigned to an anonymous
// object array is read only locally, the binding stays module-local and the per-element narrow holds
// (`this.data.at` -> `_atMaybeArray`). It still escapes when the reassigned param is passed out
// (`sink(x)` hands the array to external code -> `this.data.includes` -> generic `_includes`).
function reassignedLocal(x: any) {
  x = [{ data: ["a"], read() {
var _ref; return _atMaybeArray(_ref = this.data).call(_ref, 0); } }];
  return x[0].read();
}
function reassignedLeaked(x: any, sink: (v: unknown) => void) {
  x = [{ data: ["b"], scan() {
var _ref2; return _includes(_ref2 = this.data).call(_ref2, "z"); } }];
  sink(x);
}
export { reassignedLocal, reassignedLeaked };