// anonymous class expression returned from a factory. `Base` is a function parameter -
// the plugin can't know what gets passed at the call-site (the factory could be invoked
// with Array, a custom subclass, or anything else), so `super.from` inside the static
// method bails and stays as a native runtime reference. `const Collector = makeCollector(Array)`
// is a call result, not an alias - no static chain to walk through
function makeCollector(Base) {
  return class extends Base {
    static collect(iter) {
      return super.from(iter);
    }
  };
}
const Collector = makeCollector(Array);
Collector.collect([1, 2, 3]);