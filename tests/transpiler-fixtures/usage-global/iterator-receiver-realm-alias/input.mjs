// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  const w = choice ? globalThis : self; return w.Symbol.iterator in [3];
}
