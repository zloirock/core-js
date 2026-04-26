// multiple instance methods on a catch-destructured error: `includes` and `at` are each
// extracted via their polyfill helper, sharing the same `_ref` binding for the receiver
try {
  risky();
} catch ({ includes, at }) {
  includes("k");
  at(0);
}
