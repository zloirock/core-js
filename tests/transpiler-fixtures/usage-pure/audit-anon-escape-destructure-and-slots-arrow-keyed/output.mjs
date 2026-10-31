import _includes from "@core-js/pure/actual/instance/includes";
// Passing this object through the extracted value lets external code write its fields.
// Its method must therefore dispatch for both array and string receivers.
function take(sink, dyn) {
  const keyed = {
    [dyn]: {
      words: 'ab',
      ask() {
        var _ref;
        return _includes(_ref = this.words).call(_ref, 'a');
      }
    }
  };
  sink(keyed[dyn]);
}
take(x => x, 'k');