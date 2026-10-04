import _at from "@core-js/pure/actual/instance/at";
// A default nested inside a parameter binding snapshots its method receiver for this invocation.
// Getter reentry cannot replace it with a nested invocation's receiver.
let source;
let inner;
let depth = 0;
const make = (tag, reenter) => ({
  tag,
  get at() {
    if (reenter && depth++ === 0) {
      source = {
        list: make('I')
      };
      inner = read();
    }
    return function () {
      return this.tag;
    };
  }
});
function read({
  nested: {
    value = (() => {
      var _ref;
      return _at(_ref = source.list).call(_ref, 0);
    })()
  } = {}
} = {}) {
  return value;
}
source = {
  list: make('O', true)
};
export const result = [read(), inner];