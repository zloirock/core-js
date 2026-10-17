import _at from "@core-js/pure/actual/instance/at";
// Passing this object through the extracted value lets external code write its fields.
// Its method must therefore dispatch for both array and string receivers.
function take(sink, dyn) {
  const [fromArrayPattern] = [{
    data: ['x'],
    read() {
      var _ref;
      return _at(_ref = this.data).call(_ref, 0);
    }
  }];
  sink(fromArrayPattern);
}
take(x => x, 'k');