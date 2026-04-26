// TS `!` non-null on a static callee `Map!.groupBy(...)`: the wrapper is peeled and
// the static call rewritten to the pure-mode polyfill.
Array.from!([1]);
