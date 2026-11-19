import _at from "@core-js/pure/actual/instance/at";
// Passing this object through the extracted value lets external code write its fields.
// Its method must therefore dispatch for both array and string receivers.
function take(sink, dyn) {
  let reassigned;
  [reassigned] = [{
    nums: [1],
    pick() {
      var _ref;
      return _at(_ref = this.nums).call(_ref, 1);
    }
  }];
  sink(reassigned);
}
take(x => x, 'k');