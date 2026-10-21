// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const { a: { b: { [(effectful(), 'from')]: f } } } = { a: { b: Array } };
const probe = [1, 2].includes(2);
