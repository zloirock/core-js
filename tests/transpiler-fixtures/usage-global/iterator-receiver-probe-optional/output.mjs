// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  const {
    [Symbol.iterator]: it
  } = globalThis.window?.self;
  return typeof it;
}