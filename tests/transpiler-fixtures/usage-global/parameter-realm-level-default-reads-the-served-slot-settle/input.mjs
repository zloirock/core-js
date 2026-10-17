const realm = globalThis;
export function settle({ Promise: { allSettled, race } = WeakSet } = realm) {
  return [allSettled, race];
}
