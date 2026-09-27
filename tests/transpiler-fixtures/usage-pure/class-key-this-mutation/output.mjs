import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A realm write in a computed key invalidates later constructor inference.
class C {
  [(this.Array = Replacement, 'method')]() {}
}
_at(_ref = Array.from('abc')).call(_ref, -1);