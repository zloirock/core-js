import _at from "@core-js/pure/actual/instance/at";
// `f = () => this.items = "string"` - arrow class-field with EXPRESSION body (not a block):
// the arrow's `body` slot IS the AssignmentExpression directly. a descendants-only traversal
// never visits that root node, so the `this.<field> =` write must be handled explicitly;
// otherwise it drops, narrow stays on the init type (Array), and a type-specific polyfill ships unsoundly
class C {
  items = [1, 2, 3];
  f = () => this.items = "string";
  read() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
const c = new C();
c.f();
c.read();