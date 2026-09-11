import _includes from "@core-js/pure/actual/instance/includes";
import _Promise from "@core-js/pure/actual/promise/constructor";
var _ref, _ref2;
// `(Promise?.foo)?.bar.includes(2)` - an optional chain through a paren wrapper whose root
// is Promise. Promise is a polyfillable global (not one of the globals that ReferenceError
// on a bare lookup), yet it is still substituted to its polyfill and `.includes` narrows -
// substitution applies to any polyfillable global root.
null == (_ref = _Promise?.foo) ? void 0 : _includes(_ref2 = _ref.bar).call(_ref2, 2);