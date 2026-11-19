import _at from "@core-js/pure/actual/instance/at";
// Passing this object through the extracted value lets external code write its fields.
// Its method must therefore dispatch for both array and string receivers.
function take(sink, dyn) {
  const chained = {
    a: {}
  };
  chained.a.b = {
    bits: [4],
    poke() {
      var _ref;
      return _at(_ref = this.bits).call(_ref, 4);
    }
  };
  sink(chained.a.b);
}
take(x => x, 'k');