// nested destructure with user-owned (non-global-proxy) init `baz` - plugin cannot
// prove the receiver is the global object, so no polyfill is injected and the
// destructuring declaration stays intact.
// NOTE: `at` could theoretically be an instance method (Array.prototype.at,
// String.prototype.at, ...) but without a known receiver type we can't tell which
// prototype it belongs to. users almost never destructure prototype chains this way,
// so we accept the miss rather than over-inject a guess
const { foo: { at, bar } } = baz;
at(1); bar();
