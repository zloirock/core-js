// Same deferred-call widening as the function-declaration case, but the call sits inside an arrow.
// The enclosing-function walk recognizes the arrow too, so `o.read()` is deferred: it runs after
// `o.items` is reassigned to a string, the receiver `this.items` is `number[] | string`, and `.at`
// gets the generic polyfill.
const o = { items: [1, 2, 3], read() { return this.items.at(0); } };
const run = () => o.read();
o.items = "string";
run();
