import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `t[k]` where k: keyof T - folds to value-union of T's properties via the index
// expression's annotation, parallel to `T[keyof T]` direct case
function f<T extends { a: string[]; b: string[] }>(t: T, k: keyof T) {
  var _ref;
  return _atMaybeArray(_ref = t[k]).call(_ref, 0);
}
f({ a: ['x'], b: ['y'] }, 'a');