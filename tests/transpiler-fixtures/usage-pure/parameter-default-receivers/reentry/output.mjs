import _at from "@core-js/pure/actual/instance/at";
// A parameter default snapshots the method receiver for this invocation.
// Getter reentry cannot replace it with a nested invocation's receiver.
let inner;
let depth = 0;
const make = (tag, reenter) => ({
  tag,
  get at() {
    if (reenter && depth++ === 0) inner = read({
      list: make('I')
    });
    return function () {
      return this.tag;
    };
  }
});
function read(receiver, value = (() => {
  var _ref;
  return _at(_ref = receiver.list).call(_ref, 0);
})()) {
  return value;
}
export const result = [read({
  list: make('O', true)
}), inner];