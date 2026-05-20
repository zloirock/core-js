import _at from "@core-js/pure/actual/instance/at";
// `(this as any).items = "string"` - TS-wrapped `this` receiver on a class-field write.
// buildThisWritesIndex must peel TS_EXPR_WRAPPERS / Paren before the isThisExpression check
// so wrapped `this`-writes ARE registered as own-method `this.<field>` mutations. without
// the peel, the write slips past the index, field narrow stays on the initializer's Array
// type, and `.at()` emits the type-specific polyfill even though the runtime value may
// have been mutated to String
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