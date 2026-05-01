import _includes from "@core-js/pure/actual/instance/includes";
// labeled / plain BlockStatement / for-loop / while body do NOT rebind var-scope.
// orphan-shape `_ref = X` inside any of them stays at module top-level for adoption
// purposes (a `var _ref;` declared at module top hoists past all of them)
{
  null == (_ref = (function () { return [1, 2]; })()) ? void 0 : _includes(_ref).call(_ref, 1);
}