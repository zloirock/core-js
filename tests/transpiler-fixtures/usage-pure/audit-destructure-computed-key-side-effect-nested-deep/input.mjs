// A computed static key two levels deep follows both receiver hops.
// Its effect runs once before the source binding is initialized with the pure method.
// The independent instance call remains polyfilled.
const { a: { b: { [(effectful(), 'from')]: f } } } = { a: { b: Array } };
const probe = [1, 2].includes(2);
