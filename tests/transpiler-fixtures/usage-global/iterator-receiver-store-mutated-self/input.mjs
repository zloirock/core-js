// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  globalThis.self = choice ? { box: [7] } : null; let w; return (w = globalThis.window).self?.box.at(0);
}
