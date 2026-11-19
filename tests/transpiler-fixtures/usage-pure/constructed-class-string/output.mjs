import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A class constructor can return an object outside its declared instance family.
// Reads from that replacement must retain instance polyfills.
class C extends Array {
  constructor() {
    return Object("abc");
  }
}
_at(_ref = new C()).call(_ref, -1);