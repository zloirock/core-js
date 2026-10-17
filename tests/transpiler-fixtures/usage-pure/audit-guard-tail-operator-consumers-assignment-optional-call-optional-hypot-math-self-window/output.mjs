import _globalThis from "@core-js/pure/actual/global-this";
import _Math$hypot from "@core-js/pure/actual/math/hypot";
let switched = 0;
switch (1) {
  case 1:
    switched = null == _globalThis.window ? void 0 : _Math$hypot(3, 4);
    break;
  default:
    break;
}
export { switched };