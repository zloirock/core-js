import _values from "@core-js/pure/actual/instance/values";
function* gen() {
  yield* arr == null ? void 0 : _values(arr).call(arr);
}