import _Array$of from "@core-js/pure/actual/array/of";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Object$entries from "@core-js/pure/actual/object/entries";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// A nested static beside an object rest in an assignment whose value is read: the nested level binds
// nothing of its own - its read stays in place - and the assignment still yields its receiver, the
// array's too where the level is an element.
let entries, rest, isInteger, others, of, tail, z;
const source = {
  w: Object,
  extra: 1
};
const held = ({
  w: {},
  ...(_ref = [entries = _Object$entries])[0]
} = source, rest = _ref[0], source);
const target = {
  n: Number,
  more: 2
};
const same = ({
  n: {},
  ...(_ref2 = [isInteger = _Number$isInteger])[0]
} = target, others = _ref2[0], target) === target;
const count = ([_ref3, _ref4] = _ref5 = [{
  s: Array,
  e: 1
}, 2], {
  s: {},
  ...(_ref6 = [of = _Array$of])[0]
} = _ref3, tail = _ref6[0], z = _ref4, _ref5).length;
use(held === source, same, count, entries({}), isInteger(1), of(2), rest, others, tail, z);