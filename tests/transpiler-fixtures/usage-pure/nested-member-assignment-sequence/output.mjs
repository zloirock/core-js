import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// The sole dispatch owns the getter read inside its original control-flow position.
const wrap = {
  get box() {
    log("box");
    return {
      data: [1, 2]
    };
  }
};
let at;
at = _atMaybeArray(wrap.box.data);
log("done");