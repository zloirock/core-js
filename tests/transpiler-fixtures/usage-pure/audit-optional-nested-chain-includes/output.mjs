import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// nested optional chains with `.includes(...)`: each chain has its own guard, but the
// instance-method rewrite still fires symmetrically inside both.
null == (_ref = a?.b) ? void 0 : _includes(_ref).call(_ref, 1);