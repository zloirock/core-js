import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// the guard channel lifts a nested nav's node into a ternary alternate WITHOUT a path replace, so
// the chain walk above it answers from an emptied slot. it has to end there instead of replacing
// through it - the second row keeps nothing polyfilled on the outer tail, which is a different
// resolver route to the same nesting
export const nestedNavPlainTail = null == _globalThis.window ? void 0 : _self.Object.keys({
  b: 2
}).pop(null == _globalThis.window ? void 0 : _self.Math.round(0.4));