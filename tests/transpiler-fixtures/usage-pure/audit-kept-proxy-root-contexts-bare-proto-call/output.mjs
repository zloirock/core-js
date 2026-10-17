import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// the remaining syntactic contexts, each reaching the migration through its own visitor
let c = 0;
// bare-probe INSTANCE guard-memo spellings: the prototype-method call keeps the raw nav in
// the guard body (the locked alias/kept canon), the call-argument SE stays put; the SE-key
// claimless `new`-callee renders the pony guard inside the callee parens
export const bareProtoCall = null == (_ref = _globalThis.window) ? void 0 : _findMaybeArray((c++, _ref).Array.prototype).call([5], v => v === (c++, 5));