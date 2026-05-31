import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3;
// chain-combine receiver containing a proxy-global (`globalThis`): pure mode must substitute it to
// the imported binding (`_globalThis`) inside the memoized receiver, not emit raw `globalThis` (a
// ReferenceError on engines without it). the receiver subtree is left visitable so the substitution
// reaches it - the combine no longer blanket-skips the whole inner callee
null == (_ref2 = _flatMaybeArray(_ref = _globalThis.list)) ? void 0 : _includes(_ref3 = _ref2.call(_ref)).call(_ref3, 3);