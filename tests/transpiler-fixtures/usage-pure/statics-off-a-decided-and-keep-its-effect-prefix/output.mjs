import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// statics read off an `&&` the build decides keep the effect prefix its right runs ahead of them, in a
// declaration and an assignment alike
let groupBy, fromEntries;
console.log();
export const from = _Array$from;
export const of = _Array$of;
console.log();
groupBy = _Object$groupBy;
fromEntries = _Object$fromEntries;
export { groupBy, fromEntries };