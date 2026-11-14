// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  return (effects.push("a"), (effects.push("b"), Symbol.iterator)) in [3];
}
