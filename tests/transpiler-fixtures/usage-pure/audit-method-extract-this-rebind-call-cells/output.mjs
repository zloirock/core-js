import _at from "@core-js/pure/actual/instance/at";
// a HELD read of an own-this method (var / destructure extraction, `.call` chain, object-spread
// copy, class-instance / static / prototype extraction) hands out a function whose `this` rebinds
// at a later invocation - the this-field narrow must bail to the generic helper. a DIRECT call, a
// discarded dynamic read and a function-skipping serializer keep the narrow
const extracted = {
  cells: ['a'],
  peek() {
    var _ref;
    return _at(_ref = this.cells).call(_ref, 0);
  }
};
const m1 = extracted.peek;
m1.call({
  cells: 'zz'
});