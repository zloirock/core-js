import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
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
    value = source.list.at(0)
  } = {}
} = {}) {
  return value;
}
source = {
  list: make('O', true)
};
export const result = [read(), inner];