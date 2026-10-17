import _includes from "@core-js/pure/actual/instance/includes";
// Passing this object through the extracted value lets external code write its fields.
// Its method must therefore dispatch for both array and string receivers.
function take(sink, dyn) {
  const {
    x: holdsCarrier
  } = {
    x: [{
      list: [2],
      has() {
        var _ref;
        return _includes(_ref = this.list).call(_ref, 2);
      }
    }]
  };
  sink(holdsCarrier[0]);
}
take(x => x, 'k');