import _at from "@core-js/pure/actual/instance/at";
// Passing this object through the extracted value lets external code write its fields.
// Its method must therefore dispatch for both array and string receivers.
function take(sink, dyn) {
  const spreadCopy = {
    ...{
      w: {
        chars: ['c'],
        look() {
          var _ref;
          return _at(_ref = this.chars).call(_ref, 3);
        }
      }
    }
  };
  sink(spreadCopy.w);
}
take(x => x, 'k');