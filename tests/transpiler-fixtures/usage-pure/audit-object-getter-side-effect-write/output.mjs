import _at from "@core-js/pure/actual/instance/at";
// an object-literal getter writes to OTHER fields as a side effect, so getters must be in
// the scanned method set (parity with the class side). the `this.<other>` field-flow inside
// the literal's methods has to see the getter's `this.bar = "string"` write; otherwise `bar`
// stays narrowed Array-only and emit specializes unsoundly after the getter mutated it.
const obj = {
  bar: [1, 2, 3],
  get foo() {
    this.bar = "string";
    return null;
  },
  read() {
    var _ref;
    return _at(_ref = this.bar).call(_ref, 0);
  }
};
obj.foo;
obj.read();