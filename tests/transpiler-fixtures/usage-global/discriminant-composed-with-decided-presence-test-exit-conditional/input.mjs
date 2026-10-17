type Store = { kind: 'map'; data: Map<string, number> } | { kind: 'list'; data: number[] };
declare const flag: boolean;
export function exitConditional(store: Store) {
  if (typeof Promise != 'undefined' ? store.kind !== 'map' : flag) return;
  return store.data.forEach(log);
}
