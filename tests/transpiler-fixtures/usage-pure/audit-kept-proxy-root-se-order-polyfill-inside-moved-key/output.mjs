import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// An instance call inside a retained realm key remains independently polyfilled behind the guard.
let c = 0;
export { c };
let y;
export const polyfillInsideMovedKey = (y = _globalThis.window)?.[_flatMaybeArray(_ref = [c]).call(_ref), 'self'].Array.prototype.some.call([1], v => v);