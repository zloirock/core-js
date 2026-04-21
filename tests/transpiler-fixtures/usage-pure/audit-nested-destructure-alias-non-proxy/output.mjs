// nested destructure with non-proxy-global init — `baz` is a user-owned receiver, not
// in POSSIBLE_GLOBAL_OBJECTS. the batch flatten skips it (receiver check fails early)
// and no polyfills are injected; the declaration stays intact.
// NOTE: `at` could theoretically be an instance method (Array.prototype.at,
// String.prototype.at, ...) but without a known receiver type we can't tell which
// prototype it belongs to. users almost never deconstruct prototype chains this way,
// so we accept the miss rather than over-inject a guess
const {
  foo: {
    at,
    bar
  }
} = baz;
at(1);
bar();