// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const log = [];
const { at: first, realm: { WeakSet: Value }, includes: last } = {
  get at() { log.push('first'); return function () { return 41; }; },
  get realm() { log.push(typeof first); return globalThis; },
  get includes() { log.push(typeof Value); return function () { return 42; }; },
};
export { first, Value, last, log };
