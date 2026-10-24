// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const arr = [1, [2]];
const { x: { [(before(), 'from')]: f }, y: { [(after(), 'flat')]: m } } = { x: Array, y: arr };
