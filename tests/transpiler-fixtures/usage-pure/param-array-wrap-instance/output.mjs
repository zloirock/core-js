import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _includes from "@core-js/pure/actual/instance/includes";
// an INSTANCE leaf under an ARRAY wrapper of a parameter pattern takes the hop-instance mirror the
// object-hop twin takes: the element the wrapper pairs with is the receiver, and the synth literal
// lands IN that element - the parameter's own default, or the IIFE argument. one method per row
const viaIife = (([{
  at: viaIifeAt
}]) => viaIifeAt)([{
  at: _atMaybeArray([1, 2])
}]);
function viaDefault([{
  flat: viaDefaultFlat
}] = [{
  flat: _flatMaybeArray([[1], [2]])
}]) {
  return viaDefaultFlat;
}
const viaHopThenWrap = (({
  w: [{
    findLast: fl
  }]
}) => fl)({
  w: [{
    findLast: _findLastMaybeArray([1, 2])
  }]
});
const viaDouble = (([[{
  toReversed: tr
}]]) => tr)([[{
  toReversed: _toReversedMaybeArray([1, 2])
}]]);
const viaSibling = (([{
  toSorted: ts
}, other]) => [ts, other])([{
  toSorted: _toSortedMaybeArray([2, 1])
}, 0]);
const viaBinding = (([{
  includes: inc
}]) => inc)([{
  includes: _includes(arr)
}]);
const viaSelecting = (([{
  with: w
}]) => w)([{
  with: _withMaybeArray(c ? [1] : [2])
}]);
export { viaIife, viaDefault, viaHopThenWrap, viaDouble, viaSibling, viaBinding, viaSelecting };

// NEGATIVE: an element that RUNS is read once natively - a mirror would spell it a second time
const viaEffect = (([{
  flatMap: fm
}]) => fm)([eff()]);
export { viaEffect };