// A nested computed static key in a loop initializer follows its receiver capture.
// The key runs once before the method binding initializes; all declarations stay
// in the loop header, without lifting work across the surrounding loop.
for (const { x: { [(effectful(), 'from')]: f } } = { x: Array }; cond; ) use(f);
