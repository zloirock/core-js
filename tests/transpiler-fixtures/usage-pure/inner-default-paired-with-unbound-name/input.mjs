// an unbound name reads a realm slot, and a capitalised one is no more proven present than any other:
// where another script left that slot `undefined` the default fires, so the default keeps its
// polyfill and the paired name stays a native read - on every pairing host alike. the last row is
// the control: a known built-in is always defined, so its pair is what the pattern reads
function use() {/* empty */}
const [{ groupBy } = Map] = [UserMaps];
for (const [{ fromAsync } = Array] of [[UserArrays]]) use(fromAsync);
(({ fromEntries } = Object) => use(fromEntries))(UserObjects);
const { k: { of } = Array } = { k: UserLists };
const [{ isInteger } = {}] = [Number];
use(groupBy, of, isInteger);
