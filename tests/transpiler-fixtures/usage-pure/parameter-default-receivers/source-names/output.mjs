import _at from "@core-js/pure/actual/instance/at";
// A generated parameter-default capture cannot shadow a source parameter of the same name.
// The source receiver remains visible inside the activation's expression.
export function read(_ref, value = (() => {
  var _ref2;
  return _at(_ref2 = _ref.list).call(_ref2, 0);
})()) {
  return value;
}
export const result = read({
  list: [1]
});