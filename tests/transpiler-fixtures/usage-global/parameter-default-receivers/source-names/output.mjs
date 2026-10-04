import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A generated parameter-default capture cannot shadow a source parameter of the same name.
// The source receiver remains visible inside the activation's expression.
export function read(_ref, value = _ref.list.at(0)) {
  return value;
}
export const result = read({
  list: [1]
});