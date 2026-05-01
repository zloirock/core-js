// `super[Symbol.iterator]()` - polyfill helper would lose the super-binding (reads
// ancestor prototype's iterator instead of current class's). bail; native runtime
// resolution stays. specific to handleSymbolIterator's `t.isSuper(path.node.object)`
// early return.
class C extends X {
  *[Symbol.iterator]() {
    yield* super[Symbol.iterator]();
  }
}
