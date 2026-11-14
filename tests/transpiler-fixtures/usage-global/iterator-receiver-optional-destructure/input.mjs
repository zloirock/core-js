// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  globalThis.box = choice ? { list: [3] } : null; const { at } = globalThis.self.box?.list ?? []; return at.call([3], 0);
}
