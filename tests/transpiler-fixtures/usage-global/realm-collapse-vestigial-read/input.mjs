// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  const g = globalThis; return g.window?.Reflect?.slot;
}
