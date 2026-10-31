// `o.read()` sits inside `run()`, so it is a deferred invocation - it runs whenever `run()` is
// later called, after `o.items` has been reassigned to a string. The receiver `this.items` is
// therefore `number[] | string`, so `.at` gets the generic polyfill, not the array-specific one.
const o = { items: [1, 2, 3], read() { return this.items.at(0); } };
function run() { o.read(); }
o.items = "string";
run();
