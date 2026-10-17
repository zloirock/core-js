import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// the guard channel lifts a nested nav's node into a ternary alternate WITHOUT a path replace, so
// the chain walk above it answers from an emptied slot. it has to end there instead of replacing
// through it - the second row keeps nothing polyfilled on the outer tail, which is a different
// resolver route to the same nesting
export const nestedNavPlainTail = globalThis.window?.self.Object.keys({
  b: 2
}).pop(globalThis.window?.self.Math.round(0.4));