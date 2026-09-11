// `f = () => this.items = "string"` - arrow class-field with EXPRESSION body (not a block):
// the arrow's `body` slot IS the AssignmentExpression directly. a descendants-only traversal
// never visits that root node, so the `this.<field> =` write must be handled explicitly;
// otherwise it drops, narrow stays on the init type (Array), and a type-specific polyfill ships unsoundly
class C {
  items = [1, 2, 3];
  f = () => this.items = "string";
  read() {
    return this.items.at(0);
  }
}
const c = new C();
c.f();
c.read();
