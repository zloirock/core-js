import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// `super[Symbol.iterator]()` - rewriting the call to the iterator helper would lose the
// super-binding (reads the ancestor prototype's iterator, not the current class's). a
// Super-object computed key must skip that rewrite and keep native dispatch; the
// `Symbol.iterator` key reference is still rewritten to the pure `_Symbol$iterator`.
class C extends X {
  *[_Symbol$iterator]() {
    yield* super[_Symbol$iterator]();
  }
}