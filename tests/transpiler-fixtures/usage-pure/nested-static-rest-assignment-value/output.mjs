import _Array$of from "@core-js/pure/actual/array/of";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Object$entries from "@core-js/pure/actual/object/entries";
var _ref, _ref2, _ref3, _unused, _unused2, _unused3;
// A nested static beside an object rest in an assignment whose value is read: the nested level binds
// nothing of its own - its read stays in place - and the assignment still yields its receiver, the
// array's too where the level is an element.
let entries, rest, isInteger, others, of, tail, z;
const source = {
  w: Object,
  extra: 1
};
const held = ({} = source, source.w, entries = _Object$entries, {
  w: _unused,
  ...rest
} = source, source);
const target = {
  n: Number,
  more: 2
};
const same = ({} = target, target.n, isInteger = _Number$isInteger, {
  n: _unused2,
  ...others
} = target, target) === target;
const count = ([_ref, _ref2] = _ref3 = [{
  s: Array,
  e: 1
}, 2], _ref.s, of = _Array$of, {
  s: _unused3,
  ...tail
} = _ref, z = _ref2, _ref3).length;
use(held === source, same, count, entries({}), isInteger(1), of(2), rest, others, tail, z);