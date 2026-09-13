import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A computed realm hop under a sequence-prefixed root tests the environment probe once.
// The root prefix runs before that probe; the key effect runs only on the defined branch.
// The helper reads its leaf receiver once and needs no memo.
let c = 0;
const log = [];
export const seqRootComputedHop = null == (c++, _globalThis).window ? void 0 : _nameMaybeFunction((_pushMaybeArray(log).call(log, 'k'), _self).Array);
// the DOTTED twin, whose test the same descent already kept
export const seqRootDottedHop = null == (c++, _globalThis).window ? void 0 : _nameMaybeFunction(_self.Array);
// the BARE root, which the shared composition owns: one test, and the key effect rides the leaf
export const bareRootComputedHop = null == _globalThis.window ? void 0 : _nameMaybeFunction((_pushMaybeArray(log).call(log, 'k'), _self).Array);
export { c, log };