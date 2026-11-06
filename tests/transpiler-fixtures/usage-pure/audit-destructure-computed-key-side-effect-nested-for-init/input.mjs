// A nested computed static key stays in its for-init capture.
// It runs once before from is initialized, without lifting work outside the loop header.
for (const { x: { [(effectful(), 'from')]: f } } = { x: Array }; cond; ) use(f);
