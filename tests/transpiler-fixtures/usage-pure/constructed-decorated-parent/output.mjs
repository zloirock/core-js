import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A class decorator can replace the constructor and its instance family.
const replace = Function("return function () { return [4, 9]; }");
@replace
class B {}
class C extends B {}
_at(_ref = new C()).call(_ref, -1);