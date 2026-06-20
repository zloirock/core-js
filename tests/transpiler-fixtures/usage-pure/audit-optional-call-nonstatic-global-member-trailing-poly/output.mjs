import _includes from "@core-js/pure/actual/instance/includes";
import _Promise from "@core-js/pure/actual/promise/constructor";
var _ref, _ref2;
// optional CALL on a NON-static member of a polyfillable global, followed by a polyfilled
// instance method: the `?.` guards the (undefined) member, not the always-defined global, so it
// must SURVIVE the rewrite. native short-circuits the whole chain to undefined; dropping the `?.`
// would invoke a non-existent static and throw
const r = null == (_ref = _Promise.noSuchStatic) ? void 0 : _includes(_ref2 = _ref.call(_Promise)).call(_ref2, 0);
r;