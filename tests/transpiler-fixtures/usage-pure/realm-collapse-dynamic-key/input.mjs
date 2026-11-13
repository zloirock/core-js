// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  const key = () => "resolve"; return typeof (globalThis.window?.Promise)[key()];
}
