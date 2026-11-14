// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  const w = choice ? globalThis : { Symbol: { iterator: "slot" } }; const list = [3]; return w.Symbol.iterator in list;
}
