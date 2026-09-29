import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A sole nested assignment evaluates the member root once and retains each getter in order.
const wrap = {
  get box() {
    log('box');
    return {
      data: [1, 2]
    };
  }
};
let at;
at = _atMaybeArray(wrap.box.data);