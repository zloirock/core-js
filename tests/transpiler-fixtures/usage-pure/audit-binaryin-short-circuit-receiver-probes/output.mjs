import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
// `in` folds to a constant only while its right operand cannot be the undefined that `in` THROWS on.
const src = [3, [1, 2]];
const words = ['ab', 'cd'];
export function probes(absent) {
  var _ref;
  const arr = absent ? null : src;
  const list = absent ? null : words;
  return [('flat' in (arr == null ? void 0 : _sliceMaybeArray(arr).call(arr)), true), ('at' in (arr == null ? void 0 : _sliceMaybeArray(arr).call(arr)), true), ('includes' in (list == null ? void 0 : _concatMaybeArray(list).call(list, [])), true), ('entries' in (arr == null ? void 0 : _sliceMaybeArray(_ref = _sliceMaybeArray(arr).call(arr)).call(_ref)), true)];
}