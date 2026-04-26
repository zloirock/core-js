// `super.at(0)` from a static method reads `Array.at` on the super class itself; instance/at
// polyfill on the underlying prototype chain still applies regardless of static-vs-instance call site
class X extends Array { static m() { return super.at(0); } }
