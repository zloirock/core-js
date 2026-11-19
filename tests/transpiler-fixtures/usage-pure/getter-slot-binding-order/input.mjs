// A getter supplying the realm runs before its nested constructor binding is initialized.
// Reading that binding inside the getter must still observe its temporal dead zone.
export function readBeforeBinding(log) {
  const { w: { WeakSet: Value } } = {
    get w() { log.push(typeof Value); return globalThis; },
  };
  return Value;
}
