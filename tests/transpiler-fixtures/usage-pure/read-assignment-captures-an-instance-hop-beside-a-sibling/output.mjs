import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
var _ref, _ref2;
// An assignment whose value is read keeps its receiver, so an instance claim under a hop is captured
// even where the hop's level holds a sibling: the level splits around the captured hop in source order,
// and the assignment still yields the source's own value.
const box = {
  items: [1, 2],
  label: 'x'
};
const pair = {
  name: 'y',
  list: [3, 4]
};
let at, label, name, findLast, first, second;
first = (box, {
  items: _ref
} = box, at = _atMaybeArray(_ref), {
  label
} = box, box);
second = (pair, {
  name
} = pair, {
  list: _ref2
} = pair, findLast = _findLastMaybeArray(_ref2), pair);
export { at, label, name, findLast, first, second };