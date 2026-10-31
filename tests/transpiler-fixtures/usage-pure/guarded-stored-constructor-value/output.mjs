import _globalThis from "@core-js/pure/actual/global-this";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _self from "@core-js/pure/actual/self";
// A stored constructor keeps the environment probe and its absent value.
// The argument runs only when the constructor's optional call is reached.
let held;
const result = null == (held = null == _globalThis.window ? void 0 : _self.Number) ? void 0 : _Number$isInteger(effect());
use(result, held === undefined);