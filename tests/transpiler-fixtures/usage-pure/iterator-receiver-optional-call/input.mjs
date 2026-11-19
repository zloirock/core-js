// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  globalThis.box = choice ? { list: [3] } : null; return globalThis.box?.list[Symbol.iterator]().next().value;
}
