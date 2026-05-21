// `const [..[head]] = arr` - RestElement.argument is a nested ArrayPattern. semantically
// `head = arr[0]` (rest slice has the same element type as the source; inner pattern
// destructures the slice positionally). findArrayPatternKeyPath bailed via `continue` on
// non-Identifier rest argument, losing head's path. recurse into the inner ArrayPattern
// and offset positional hits by the rest's outer index (`i + innerPos`) so head's path
// becomes [0] - mapping correctly to a STRING element of the source string[], not the
// whole-slice Array branch. ObjectPattern / nested-rest inside rest stay unsupported
// (non-positional or unmappable) and bail to null so callers don't see a wrong path
declare const arr: string[];
const [...[head]] = arr;
head.at(0);
