import _at from "@core-js/pure/actual/instance/at";
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
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
const c = new C();
c.f();
c.read();