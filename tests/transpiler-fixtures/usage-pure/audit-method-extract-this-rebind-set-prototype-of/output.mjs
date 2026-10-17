import _includes from "@core-js/pure/actual/instance/includes";
const inherited = {
  seq: 'st',
  find2() {
    var _ref;
    return _includes(_ref = this.seq).call(_ref, 's');
  }
};
const heir = {};
Object.setPrototypeOf(heir, inherited);