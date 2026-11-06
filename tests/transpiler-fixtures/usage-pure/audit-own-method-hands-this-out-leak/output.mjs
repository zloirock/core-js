import _at from "@core-js/pure/actual/instance/at";
// The field scan collects what a method writes INSIDE the object (`this.<field> = ...`), but a method that passes `this` ON hands
// the receiver to code the scan cannot follow, and every write through it lands outside.
const handsOut = {
  rows: [1, 2],
  leak() {
    sink(this);
  },
  read() {
    var _ref;
    return _at(_ref = this.rows).call(_ref, 0);
  }
};
handsOut.leak();