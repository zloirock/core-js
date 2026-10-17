import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
// the outer chain's own CALL runs in full between the two reads, and its argument can reach the root
// through an iterator or an accessor - another shape whose inner test has to stay put
const seed = [7, 8];
export const spineCallBeforeKey = null == _globalThis.window ? void 0 : _Array$from(seed)[null == _globalThis.window ? void 0 : _Math$trunc(0.5)];