import _at from "@core-js/pure/actual/instance/at";
// Passing this object through the extracted value lets external code write its fields.
// Its method must therefore dispatch for both array and string receivers.
function take(sink, dyn) {
  let rest;
  [...rest] = [[{
    deep: ['d'],
    grab() {
      var _ref;
      return _at(_ref = this.deep).call(_ref, 2);
    }
  }]];
  sink(rest[0][0]);
}
take(x => x, 'k');