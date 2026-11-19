import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A caller's shadowed alias cannot replace the function declaration's constraint.
type Mode = 'lines' | 'text';
declare function read<T extends Mode>(value: T): {
  rows: T extends 'lines' ? number[] : string;
};
export function last() {
  var _ref;
  type Mode = {};
  return _atMaybeArray(_ref = read('lines').rows).call(_ref, -1);
}