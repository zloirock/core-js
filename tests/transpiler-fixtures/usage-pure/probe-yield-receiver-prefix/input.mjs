// The retained key runs after the receiver prefix, including a read that may throw.
function realm() { return globalThis.window; }
export function read(log) {
  return (log('before'), missingReceiverPrefix, (log('after'), realm())).self?.[(log('key'), 'Math')].PI;
}
