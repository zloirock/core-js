import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A nullable stored receiver can select its fallback.
// Its store and fallback effects each run once.
let held;
const {
  resolve
} = (null == (held = (note(), _globalThis.window)) ? void 0 : {
  resolve: _Promise$resolve
}) || {};
use(resolve, held);