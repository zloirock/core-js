import _includes from "@core-js/pure/actual/instance/includes";
import _Promise from "@core-js/pure/actual/promise/constructor";
var _ref, _ref2;
// `(Promise?.foo)?.bar.includes(2)` - non-POSSIBLE_GLOBAL leaf (Promise) through Paren
// wrapper. resolveProxyGlobalChainSrc still substitutes `Promise` -> `_Promise` via
// rebuild path because the chain-substituter accepts ANY polyfillable global, not just
// the IE11-ReferenceError-prone proxy set. asserts the rebuild path works uniformly
// across leaf identifiers regardless of POSSIBLE_GLOBAL_OBJECTS membership.
null == (_ref = _Promise?.foo) ? void 0 : _includes(_ref2 = _ref.bar).call(_ref2, 2);