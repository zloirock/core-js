import _at from "@core-js/pure/actual/instance/at";
// Object.freeze returns the object with its own grab method. The extracted method
// reads keys2 from the receiver supplied to call.
const frozen = {
  keys2: ['k'],
  grab() {
    var _ref;
    return _at(_ref = this.keys2).call(_ref, 6);
  }
};
const alias = Object.freeze(frozen);
const m5 = alias.grab;
m5.call({
  keys2: 'kk'
});