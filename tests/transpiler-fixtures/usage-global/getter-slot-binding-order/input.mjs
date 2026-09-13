// The getter executes while the destructured declaration is still uninitialized.
// Reading that binding must keep its temporal-dead-zone failure after rewriting.
// A constructor escaping through the getter includes its static methods.
export function readBeforeBinding(log) {
  const { w: { WeakSet: Value } } = {
    get w() { log.push(typeof Value); return globalThis; },
  };
  return Value;
}
