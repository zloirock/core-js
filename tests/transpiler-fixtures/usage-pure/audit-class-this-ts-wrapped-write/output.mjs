import _at from "@core-js/pure/actual/instance/at";
// `(this as any).items = "string"` - a TS-wrapped `this` receiver on a class-field write.
// the this-writes index must peel TS / Paren wrappers before the ThisExpression check so
// wrapped `this`-writes ARE registered as own-method `this.<field>` mutations. without the
// peel the write slips past the index and `.at()` emits the type-specific polyfill unsoundly
class C {
  items = [1, 2, 3];
  mutate() {
    (this as any).items = "string";
  }
  read() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
new C().read();