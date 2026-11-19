import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A nullish selection keeps a nullable stored left and the fallback arm.
let held, from;
({
  from
} = (null == (held = _globalThis.window) ? void 0 : {
  from: _Array$from
}) ?? {});
use(from, held);