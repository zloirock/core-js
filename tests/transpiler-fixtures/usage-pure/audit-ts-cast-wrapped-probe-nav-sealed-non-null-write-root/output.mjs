import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// @ts-expect-error a binding written ahead of its declaration is the shape under test
export const sealedNonNullWriteRoot = ((null == (held2 = _globalThis).window ? void 0 : _self).Symbol, _Symbol$iterator);
let held2: unknown;
export { held2 };