import _Array$from from "@core-js/pure/actual/array/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
eff('a'), eff('b');
// a destructure consuming a selection the build decides behind an effect prefix keeps only what runs of it: the
// prefix and the live arm's own effects, never a read of the constructor the claim folded - in a declaration and in
// an assignment alike
const groupBy = _Map$groupBy;
let from;
eff('c'), eff('d');
from = _Array$from;
export { groupBy, from };