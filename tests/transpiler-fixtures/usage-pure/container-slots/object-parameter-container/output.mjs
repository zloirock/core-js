import _values from "@core-js/pure/actual/instance/values";
// A nested read uses the object supplied to the container parameter.
const parameterContainer = function (incoming) {
  const values = _values(incoming.k);
  return values;
}({
  k: Object
});
export { parameterContainer };