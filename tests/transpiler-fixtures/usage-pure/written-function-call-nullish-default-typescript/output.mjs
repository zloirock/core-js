import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// An all-nullish union retains undefined as a possible default trigger.
const box: {
  fn?: (value?: number[] | null) => number[] | null;
} = {};
box.fn = (value: number[] | null = [8, 9]) => value;
const arg: null | undefined = undefined;
use(null == (_ref = box.fn(arg)) ? void 0 : _atMaybeArray(_ref).call(_ref, -1));