// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  globalThis.box = [3, 4]; let w; return (w = globalThis.window).self?.box.at(0);
}
