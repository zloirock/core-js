// A nested static beside an object rest in an assignment whose value is read: the nested level binds
// nothing of its own - its read stays in place - and the assignment still yields its receiver, the
// array's too where the level is an element.
let entries, rest, isInteger, others, of, tail, z;
const source = { w: Object, extra: 1 };
const held = ({ w: { entries }, ...rest } = source);
const target = { n: Number, more: 2 };
const same = ({ n: { isInteger }, ...others } = target) === target;
const count = ([{ s: { of }, ...tail }, z] = [{ s: Array, e: 1 }, 2]).length;
use(held === source, same, count, entries({}), isInteger(1), of(2), rest, others, tail, z);
