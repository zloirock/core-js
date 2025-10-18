// proposal stage: 2
// https://github.com/tc39/proposal-upsert

interface Map<K, V> {
  getOrInsert(key: K, value: V): V;
  getOrInsertComputed<R extends V>(key: K, callbackFn: (key: K) => R): R;
}

interface WeakMap<K, V> {
  getOrInsert(key: K, value: V): V;
  getOrInsertComputed<R extends V>(key: K, callbackFn: (key: K) => R): R;
}
