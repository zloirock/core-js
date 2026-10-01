import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// The optional user root is read once and remains sealed before the pattern reads data.
const wrap = {
  get box() {
    log("box");
    return {
      data: [1, 2]
    };
  }
};
let at;
at = _atMaybeArray((wrap?.box).data);