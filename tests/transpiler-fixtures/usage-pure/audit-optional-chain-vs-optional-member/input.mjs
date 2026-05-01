// babel: dedicated OptionalMemberExpression / OptionalCallExpression node types.
// oxc/ESTree: ChainExpression wrapping a CallExpression / MemberExpression with optional: true.
// Both forms must be handled symmetrically by all resolver paths
const obj: { items?: any[] } = {};
const a = obj.items?.at(0);
const b = obj?.items?.flatMap(x => [x]);
const c = (obj.items)?.includes(7);
