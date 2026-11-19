import _at from "@core-js/pure/actual/instance/at";
const taggedSubstitution = {
  cells: [1, 2],
  read() {
    var _ref;
    return _at(_ref = this.cells).call(_ref, 0);
  }
};
tag`${taggedSubstitution}`;