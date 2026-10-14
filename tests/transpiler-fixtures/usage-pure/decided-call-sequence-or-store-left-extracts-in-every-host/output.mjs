import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// A `||` / `??` left that is a call returning a constructor, a sequence ending in one or a store of one
// decides its selection, so a pattern over it extracts the static in every host - beside a rest or a
// sibling, in a parameter default and between sibling declarators - with the left's effect kept ahead.
const pickMap = () => _Map;
const pickPromise = () => _Promise;
let n = 0,
  held;
const f1 = (n++, _Array$from),
  {
    from: _unused,
    ...r1
  } = Array;
const g2 = _Map$groupBy;
const {
  size
} = pickMap();
n++;
const o3 = _Array$of;
const {
  other3
} = Array;
function p4({
  try: t4
} = {
  try: _Promise$try
}) {
  return t4;
}
const a5 = 1;
held = Object;
const e5 = _Object$fromEntries;
const b5 = 2;
export { f1, r1, g2, size, o3, other3, p4, a5, e5, b5, n };