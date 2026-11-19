import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A later global write does not make an earlier inert call escape its argument.
const box = {
  read() {
    return [3];
  }
};
Object.keys(box);
export const result = _atMaybeArray(_ref = box.read()).call(_ref, 0);
if (flag) _globalThis.Object = other;