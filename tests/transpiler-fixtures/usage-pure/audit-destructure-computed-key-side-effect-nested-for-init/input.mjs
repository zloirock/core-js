// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live.
for (const { x: { [(effectful(), 'from')]: f } } = { x: Array }; cond; ) use(f);
