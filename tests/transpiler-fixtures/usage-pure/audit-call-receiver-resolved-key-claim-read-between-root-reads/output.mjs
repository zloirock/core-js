import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
// a plain property read in the same slot: its getter is user code, so it can reach the root between
// the two reads exactly as a call can
const hopBox = {
  n: 4
};
export const readBetweenRootReads = null == _globalThis.window ? void 0 : _Array$of(hopBox.n, null == _globalThis.window ? void 0 : _Math$trunc(3.5));