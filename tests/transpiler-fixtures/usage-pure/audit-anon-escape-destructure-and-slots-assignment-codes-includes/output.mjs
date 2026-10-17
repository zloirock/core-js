import _includes from "@core-js/pure/actual/instance/includes";
const storedWritten = {};
storedWritten.f = {
  codes: 'kw',
  check() {
    var _ref;
    return _includes(_ref = this.codes).call(_ref, 'k');
  }
};
storedWritten.f.codes = 5;