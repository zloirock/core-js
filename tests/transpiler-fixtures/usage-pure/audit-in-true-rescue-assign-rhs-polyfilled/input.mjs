// `'key' in (y = Map)` rescue: RHS AssignmentExpression is preserved verbatim into the
// replacement `(y = Map, true)`. without exempting AssignmentExpression-RHS from the
// `walkAstNodes(skippedNodes.add)` sweep, the inner `Map` Identifier's proxy-global rewrite
// is suppressed and raw `Map` strands into the output (IE11 ReferenceError)
let y;
const x = "groupBy" in (y = Map);
