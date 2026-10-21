// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const log = [];
export const { before, box: { first, realm: { WeakSet: Value }, last }, after } = {
  get before() { log.push('before'); return 1; },
  get box() {
    log.push('box');
    return {
      get first() { log.push('first'); return 2; },
      get realm() { log.push('realm'); return globalThis; },
      get last() { log.push(typeof Value); return 3; },
    };
  },
  get after() { log.push(typeof Value); return 4; },
};
export { log };
