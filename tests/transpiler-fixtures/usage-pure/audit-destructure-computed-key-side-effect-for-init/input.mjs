// A computed static key in a for-init declarator evaluates the key and binds the pure static in the
// same header slot: the receiver is a proven constructor, so nothing captures it. The effect runs
// once and the polyfill always wins.
for (const { [(effectful(), 'from')]: from } = Array; cond;) use(from);
