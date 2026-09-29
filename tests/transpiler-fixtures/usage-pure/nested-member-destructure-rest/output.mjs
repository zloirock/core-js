import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A rest copy reads field values without exposing the source object or widening its fields.
const wrap = {
  box: {
    data: [1, 2]
  }
};
const {
  ...rest
} = wrap.box;
export const at = _atMaybeArray(wrap.box.data);