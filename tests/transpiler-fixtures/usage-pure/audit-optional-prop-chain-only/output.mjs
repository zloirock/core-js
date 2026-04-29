import _at from "@core-js/pure/actual/instance/at";
var _ref;
// `obj?.foo.bar` rewritten to a guarded call must keep the dot between `foo` and `bar` -
// only the optional hop is removed.
obj == null ? void 0 : _at(_ref = obj.foo.bar).call(_ref, 0);