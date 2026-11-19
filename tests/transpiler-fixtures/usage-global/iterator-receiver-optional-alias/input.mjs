// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  globalThis.box = choice ? { list: [3] } : null; const g = globalThis; return g.box?.list[Symbol.iterator]().next().value;
}
