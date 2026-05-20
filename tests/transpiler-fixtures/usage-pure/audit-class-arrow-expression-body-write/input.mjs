// `f = () => this.items = "string"` - arrow class-field with EXPRESSION body (not a block).
// the arrow's `body` slot IS the AssignmentExpression directly. `path.traverse(visitors)`
// walks descendants only, so the root AssignmentExpression isn't visited by the
// `this.<field> = Y` recorder. buildThisWritesIndex must explicitly handle the root after
// the traversal completes - otherwise the write is silently dropped and field narrow stays
// on the init type (Array), emitting type-specific polyfill unsoundly
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
