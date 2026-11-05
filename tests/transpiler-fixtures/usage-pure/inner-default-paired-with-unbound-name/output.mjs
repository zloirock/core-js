import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// Unknown supplied values keep runtime identity tests against receiver defaults.
// Supported fallback statics are served; an unrelated static-only literal wrapper stays native.
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