import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A static claim retains its stored receiver exactly once before calling the polyfill.
const held = _globalThis.window;
let first, second;
((first = second = held).self, _Array$of)(3);