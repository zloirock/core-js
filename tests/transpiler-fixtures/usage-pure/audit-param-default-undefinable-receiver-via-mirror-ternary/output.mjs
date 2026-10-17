import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// nested mirror in a runtime ternary
let cond1 = false;
export function viaMirrorTernary({
  Array: {
    of
  }
} = cond1 ? null == _globalThis.window ? void 0 : _self : {
  Array: {
    of: () => 1
  }
}) {
  return of;
}