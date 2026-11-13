import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// A bound hop in a captured array element keeps the method extraction on assignment.
const K = 'row';
const source = [{
  row: [3, 7]
}];
let at;
[_ref] = source, {
  [K]: _ref2
} = _ref, at = _at(_ref2);
export const result = at.call([3, 7], -1);