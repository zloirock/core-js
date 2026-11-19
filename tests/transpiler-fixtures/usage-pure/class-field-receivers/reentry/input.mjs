// An instance field snapshots its method receiver for this instance's initialization.
// Getter reentry into another instance cannot replace the receiver of the outer field.
let source;
let inner;
let depth = 0;
const make = (tag, reenter) => ({
  tag,
  get at() {
    if (reenter && depth++ === 0) {
      source = { list: make('I') };
      inner = new Box().value;
    }
    return function () { return this.tag; };
  }
});
class Box {
  value = source.list.at(0);
}
source = { list: make('O', true) };
export const result = [new Box().value, inner];
