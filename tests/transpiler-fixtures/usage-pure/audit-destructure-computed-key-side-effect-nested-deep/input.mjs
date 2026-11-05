// A computed static key two levels deep follows both receiver hops once.
// The key precedes the served from binding; the independent includes call is also polyfilled.
const { a: { b: { [(effectful(), 'from')]: f } } } = { a: { b: Array } };
const probe = [1, 2].includes(2);
