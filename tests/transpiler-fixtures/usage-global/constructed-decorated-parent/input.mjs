// A class decorator can replace the constructor and its instance family.
const replace = Function("return function () { return [4, 9]; }");
@replace
class B {}
class C extends B {}
new C().at(-1);
