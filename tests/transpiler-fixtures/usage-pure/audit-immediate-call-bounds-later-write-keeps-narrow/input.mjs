// `o.read()` runs at its source position, BEFORE `o.items` is reassigned to a string. The immediate
// (non-deferred) call bounds the later write out of scope, so at the call site `this.items` is still
// `number[]` and `.at` gets the array-specific polyfill. Contrast the deferred-call case, where the
// call sits inside a function and the later write is visible.
const o = { items: [1, 2, 3], read() { return this.items.at(0); } };
o.read();
o.items = "string";
