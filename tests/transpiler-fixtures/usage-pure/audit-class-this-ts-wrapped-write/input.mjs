// `(this as any).items = "string"` - TS-wrapped `this` receiver on a class-field write.
// buildThisWritesIndex must peel TS expression wrappers / Paren before the isThisExpression check
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
    return this.items.at(0);
  }
}
new C().read();
