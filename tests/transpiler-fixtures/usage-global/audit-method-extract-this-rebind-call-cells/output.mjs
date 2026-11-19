import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// a HELD read of an own-this method (var / destructure extraction, `.call` chain, object-spread
// copy, class-instance / static / prototype extraction) hands out a function whose `this` rebinds
// at a later invocation - the this-field narrow must bail to the generic helper. a DIRECT call, a
// discarded dynamic read and a function-skipping serializer keep the narrow
const extracted = {
  cells: ['a'],
  peek() {
    return this.cells.at(0);
  }
};
const m1 = extracted.peek;
m1.call({
  cells: 'zz'
});