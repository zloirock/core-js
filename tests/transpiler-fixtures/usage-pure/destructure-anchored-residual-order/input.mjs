// A symbol claim leaves adjacent constructor hops to the ordered residual split.
// Each native setter observes the source order in both statement and bodyless slots.
export function read(target, enabled) {
  ({ Set: { customSet: target.left }, [Symbol.iterator]: target.middle, Map: { customMap: target.right } } = globalThis);
  if (enabled) ({ Set: { customSet: target.left }, [Symbol.iterator]: target.middle, Map: { customMap: target.right } } = globalThis);
  if (enabled) var { WeakMap: { customWeak }, [Symbol.iterator]: other, WeakSet: { customWeakSet } } = globalThis;
  return [customWeak, other, customWeakSet];
}
