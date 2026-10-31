// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims.
function use() {/* empty */}
const [{ groupBy } = Map] = [UserMaps];
for (const [{ fromAsync } = Array] of [[UserArrays]]) use(fromAsync);
(({ fromEntries } = Object) => use(fromEntries))(UserObjects);
const { k: { of } = Array } = { k: UserLists };
const [{ isInteger } = {}] = [Number];
use(groupBy, of, isInteger);
