// A computed static key in a for-init declarator captures the receiver as a sibling declarator,
// then evaluates the key and binds the pure static in the same header. The effect runs once and the
// polyfill always wins.
for (const { [(effectful(), 'from')]: from } = Array; cond;) use(from);
