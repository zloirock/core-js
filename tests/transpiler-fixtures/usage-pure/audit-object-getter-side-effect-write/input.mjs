// object-literal getter writes to OTHER fields as a side effect. ownerMethodFns must
// include getters in the scanned method set (previously skipped via `kind === 'get'`
// shortcut, asymmetric with the class-side counterpart). field-flow for `this.<other>`
// inside the literal's own methods consults `getInstanceMethodThisWrites`; without
// getters in the input set, the `this.bar = "string"` write is invisible to the scan
// and `bar`'s narrow stays Array-only - emit specializes unsoundly even though the
// getter has already mutated the runtime value to a string
const obj = {
  bar: [1, 2, 3],
  get foo() {
    this.bar = "string";
    return null;
  },
  read() {
    return this.bar.at(0);
  },
};
obj.foo;
obj.read();
