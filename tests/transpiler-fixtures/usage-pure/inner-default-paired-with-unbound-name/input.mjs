// Unknown supplied values keep runtime identity tests against receiver defaults.
// Supported fallback statics are served; an unrelated static-only literal wrapper stays native.
function use() {/* empty */}
const [{ groupBy } = Map] = [UserMaps];
for (const [{ fromAsync } = Array] of [[UserArrays]]) use(fromAsync);
(({ fromEntries } = Object) => use(fromEntries))(UserObjects);
const { k: { of } = Array } = { k: UserLists };
const [{ isInteger } = {}] = [Number];
use(groupBy, of, isInteger);
