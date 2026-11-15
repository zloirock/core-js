import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Annotation-level member lookup uses the same literal inference as a direct return.
declare function read<T extends string>(mode: T): {
  rows: T extends 'lines' ? number[] : string;
};
_atMaybeArray(_ref = read('lines').rows).call(_ref, -1);