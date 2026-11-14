import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A nested default keeps its fallback and reads the written realm once.
if (flag) _globalThis.self = other;
const at = (_ref = _at(self.Array.prototype)) === void 0 ? fallback : _ref;
export { at };