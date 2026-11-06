import _includes from "@core-js/pure/actual/instance/includes";
const called = {
  list: [2],
  has() {
    var _ref;
    return _includes(_ref = this.list).call(_ref, 2);
  }
};
called.has.call({
  list: 'pq'
});