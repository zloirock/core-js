// Receiver prefixes precede computed keys; optional calls retain the selected receiver.
export function invoke(box, log) {
  return (log('prefix'), box.rows)[(log('key'), Symbol.iterator)]?.(log('argument'));
}

// A stable receiver still performs its first read before a key that can throw.
export function read(rows, log) {
  return (log('prefix'), rows)[(log('key'), Symbol.iterator)];
}

// A live inner guard skips both the key and the consumption when its base is absent.
export function guarded(box, log) {
  return box?.rows[(log('key'), Symbol.iterator)]();
}

// Ordinary instance consumers share receiver evaluation with symbol consumers.
export function instance(box, log) {
  return (log('prefix'), box.rows)[(log('key'), 'at')];
}
