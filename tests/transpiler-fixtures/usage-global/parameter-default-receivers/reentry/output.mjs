import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
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
function read(receiver, value = receiver.list.at(0)) {
  return value;
}
export const result = [read({
  list: make('O', true)
}), inner];