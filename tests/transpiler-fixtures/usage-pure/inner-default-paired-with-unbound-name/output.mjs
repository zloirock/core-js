import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// an unbound name reads a realm slot, and a capitalised one is no more proven present than any other:
// where another script left that slot `undefined` the default fires, so the default keeps its
// polyfill and the paired name stays a native read - on every pairing host alike. the last row is
// the control: a known built-in is always defined, so its pair is what the pattern reads
function use() {/* empty */}
const [{
  groupBy
} = {
  groupBy: _Map$groupBy
}] = [UserMaps];
for (const [{
  fromAsync
} = {
  fromAsync: _Array$fromAsync
}] of [[UserArrays]]) use(fromAsync);
(({
  fromEntries
} = {
  fromEntries: _Object$fromEntries
}) => use(fromEntries))(UserObjects);
const {
  k: {
    of
  } = {
    of: _Array$of
  }
} = {
  k: UserLists
};
const [{
  isInteger
} = {}] = [{
  isInteger: _Number$isInteger
}];
use(groupBy, of, isInteger);