import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$values from "@core-js/pure/actual/object/values";
// A keyed read under a hop beside a sibling the capture splits off: the capture's own receiver ref
// proves the hop's slot as a source name does, so the hop mirrors and binds no ref nothing reads,
// the key runs once where the source wrote it, and the sibling reads the capture.
function make() {
  log('make');
  return {
    w: Array,
    v: Object,
    n: Number,
    other: 1
  };
}
const _ref = make(),
  {
    w: {}
  } = _ref,
  from = (log('from'), _Array$from),
  {
    other
  } = _ref;
let _ref2 = make(),
  {
    v: {}
  } = _ref2,
  entries = (log('entries'), _Object$entries),
  values = _Object$values,
  {
    other: second
  } = _ref2;
export function inside() {
  var _ref3 = make(),
    {
      n: {}
    } = _ref3,
    isInteger = (log('isInteger'), _Number$isInteger),
    {
      other: third
    } = _ref3;
  return [isInteger, third];
}
const _ref4 = make(),
  {
    w: {}
  } = _ref4,
  of = (log('of'), _Array$of),
  {
    other: fourth
  } = _ref4;
export { of, fourth };
for (const _ref5 = make(), {
    v: {}
  } = _ref5, assign = (log('assign'), _Object$assign), {
    other: fifth
  } = _ref5;;) {
  use(assign, fifth);
  break;
}
use(from, other, entries, values, second);