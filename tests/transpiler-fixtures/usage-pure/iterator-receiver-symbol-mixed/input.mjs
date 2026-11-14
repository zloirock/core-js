// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  const S = { iterator: "slot" }; return (choice ? Symbol : S).iterator in [3];
}
