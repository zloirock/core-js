import _includes from "@core-js/pure/actual/instance/includes";
// Passing this object through the extracted value lets external code write its fields.
// Its method must therefore dispatch for both array and string receivers.
function take(sink, dyn) {
  const {
    x: fromObjectPattern
  } = {
    x: {
      tags: 'xy',
      scan() {
        var _ref;
        return _includes(_ref = this.tags).call(_ref, 'x');
      }
    }
  };
  sink(fromObjectPattern);
}
take(x => x, 'k');