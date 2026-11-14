// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  globalThis.box = [3]; const box = {}; return (box.w = globalThis.window).self?.[(effects.push("key"), "box")].at(0);
}
