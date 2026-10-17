import _includes from "@core-js/pure/actual/instance/includes";
// Passing this object through the extracted value lets external code write its fields.
// Its method must therefore dispatch for both array and string receivers.
function take(sink, dyn) {
  const holder = {};
  holder.f = {
    marks: 'mn',
    test() {
      var _ref;
      return _includes(_ref = this.marks).call(_ref, 'm');
    }
  };
  sink(holder.f);
}
take(x => x, 'k');