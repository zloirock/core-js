import _at from "@core-js/pure/actual/instance/at";
var _ref;
// ?.prop (non-call, non-computed) keeps the `.` in deoptionalizeNeedle - the replacement
// from an outer transform writes `obj.foo.bar` but the raw needle is `obj?.foo.bar`
obj == null ? void 0 : _at(_ref = obj.foo.bar).call(_ref, 0);