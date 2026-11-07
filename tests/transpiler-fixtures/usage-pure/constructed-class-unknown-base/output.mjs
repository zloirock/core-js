import _at from "@core-js/pure/actual/instance/at";
var _ref;
// An unknown base can return an object without the subclass prototype.
// Its method return need not match the subclass declaration.
class C extends External {
  value() {
    return "ab";
  }
}
_at(_ref = new C().value()).call(_ref, -1);