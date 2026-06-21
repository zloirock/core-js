import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `const [...[head]] = arr` - the RestElement argument is a nested ArrayPattern, so
// `head = arr[0]` (the rest slice shares the source element type). path resolution must
// recurse into the inner ArrayPattern and offset positional hits by the rest's outer index,
// so `head` maps to a STRING element of `string[]`, not the whole-slice Array branch.
// ObjectPattern / nested-rest inside rest stay unsupported and bail to null, not a wrong path
declare const arr: string[];
const [...[head]] = arr;
_atMaybeString(head).call(head, 0);