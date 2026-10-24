import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// a constraint with a `string` index signature bounds the value at every key a subtype may add,
// so `t[k]` with `k: keyof T` folds to that value type - the index-signature and `Record`
// spellings alike - where named members alone leave it generic
function f<T extends {
  [key: string]: string[];
}>(t: T, k: keyof T) {
  var _ref;
  return _atMaybeArray(_ref = t[k]).call(_ref, 0);
}
function g<T extends Record<string, string>>(t: T, k: keyof T) {
  var _ref2;
  return _includesMaybeString(_ref2 = t[k]).call(_ref2, 'a');
}