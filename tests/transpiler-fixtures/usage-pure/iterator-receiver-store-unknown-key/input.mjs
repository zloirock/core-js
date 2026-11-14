// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  globalThis.box = [3, 4]; Array.prototype.extra = 1; const key = ["b", "o", "x"].join(""); let w; return (w = globalThis.window).self?.[key].at(0);
}
