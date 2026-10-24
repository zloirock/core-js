import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A consumed sequence keeps the sole dispatch and one getter read inside the expression.
const wrap = {
  get box() {
    log("box");
    return {
      data: [1, 2]
    };
  }
};
let at;
export const value = (at = _atMaybeArray(wrap.box.data), at);