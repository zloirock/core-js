// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  return (typeof Symbol !== "undefined" ? Symbol : {}).iterator in [3];
}
