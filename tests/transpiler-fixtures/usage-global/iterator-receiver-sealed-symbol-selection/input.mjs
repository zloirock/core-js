// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  return (choice ? Symbol : (globalThis.window?.self).Symbol).iterator in [3];
}
