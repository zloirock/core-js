import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims.
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
} = {}] = [Number];
use(groupBy, of, isInteger);