import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// long optional chain ending in `.includes(...)`: every link is tracked so the final
// instance-method rewrite uses a single shared guard for the chain.
null == (_ref = a?.b?.c) ? void 0 : _includes(_ref).call(_ref, 1);