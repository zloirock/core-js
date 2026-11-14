// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  for (const { [Symbol.iterator]: it } of [globalThis.window]) return typeof it;
}
