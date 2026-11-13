// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  const key = () => (effects.push("key"), "resolve"); return typeof (globalThis.window?.Promise)[key()];
}
