// Shared capture and receiver-default routes preserve independently supported claims.
// Getter reads and binding initialization keep their source order. Instance claims retain their own receivers.
export function readBeforeBinding(log) {
  const { w: { WeakSet: Value } } = {
    get w() { log.push(typeof Value); return globalThis; },
  };
  return Value;
}
