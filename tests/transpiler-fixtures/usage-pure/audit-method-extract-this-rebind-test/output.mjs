import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// direct call, discarded dynamic read and function-skipping serialization keep the narrow
const direct = {
  marks: 'mn',
  test() {
    var _ref;
    return _includesMaybeString(_ref = this.marks).call(_ref, 'm');
  }
};
direct.test();