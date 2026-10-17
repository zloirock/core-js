import _at from "@core-js/pure/actual/instance/at";
const copied = {
  nums: [1],
  pick() {
    var _ref;
    return _at(_ref = this.nums).call(_ref, 1);
  }
};
const twin = {
  ...copied,
  nums: 'xy'
};
twin.pick();