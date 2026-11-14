// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  return ((effects.push("test"), choice) ? Symbol : Symbol).iterator in [3];
}
