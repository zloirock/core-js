import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// `super[Symbol.iterator]()` - polyfill helper would lose the super-binding (reads
// ancestor prototype's iterator instead of current class's). bail; native runtime
// resolution stays. specific to handleSymbolIterator's `t.isSuper(path.node.object)`
// early return.
class C extends X {
  *[_Symbol$iterator]() {
    yield* super[_Symbol$iterator]();
  }
}