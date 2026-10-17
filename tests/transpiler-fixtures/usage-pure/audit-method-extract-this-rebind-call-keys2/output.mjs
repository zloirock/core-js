import _at from "@core-js/pure/actual/instance/at";
// an identity-returning callee result held = an untracked alias; the PROTO slot of
// setPrototypeOf makes the receiver inherit the methods
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