// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const log = [];
let caught;
try {
  const { first, realm: { WeakSet: Value }, last } = {
    get first() { log.push('first'); return 1; },
    get realm() {
      log.push('realm');
      const type = typeof Value;
      log.push(type);
      return globalThis;
    },
    get last() { log.push('last'); return 2; },
  };
  log.push(first, last, Value);
} catch (error) {
  caught = error.name;
}
export const result = [caught, log];
