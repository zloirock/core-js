import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// The public signature gives v an array type even though the implementation uses any.
function read(): {
  v: number[];
};
function read(): {
  v: any;
} {
  return {
    v: [3]
  };
}
export const result = _atMaybeArray(_ref = read().v).call(_ref, 0);