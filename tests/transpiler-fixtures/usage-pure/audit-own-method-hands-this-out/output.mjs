import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// the field scan collects what a method writes INSIDE the object (`this.<field> = ...`), but a
// method that passes `this` ON hands the receiver to code the scan cannot follow, and every write
// through it lands outside. a method that only READS `this` opens no such channel. the body need
// not be written here either: a spread copies another object's own methods in, and calling one runs
// it with this receiver - a key spelled out AFTER the spread supersedes the copy and stays readable
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
const readsOnly = {
  cells: [1, 2],
  size() {
    return this.cells.length;
  },
  read() {
    var _ref2;
    return _includesMaybeArray(_ref2 = this.cells).call(_ref2, 1);
  }
};
readsOnly.size();
const viaSpread = {
  ...source,
  slots: [1, 2],
  read() {
    var _ref3;
    return _includes(_ref3 = this.slots).call(_ref3, 1);
  }
};
viaSpread.borrowed();