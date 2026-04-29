// AssignmentExpression destructure with sibling RestElement: outer pattern's `...rest`
// gathers all OTHER own keys, so silently dropping the proxy-flatten path would lose
// rest-binding. cascade emits `_unused` sentinel + separate polyfill assignment so rest
// is preserved AND polyfill always wins regardless of native receiver field. inner-level
// RestElement (`{Array: {from, ...inner}}`) hits the same constraint - sentinel preservation
// covered by both VariableDeclaration and AssignmentExpression cascade paths
let from, rest, fromEntries, inner;
({ Array: { from }, ...rest } = globalThis);
({ Object: { fromEntries, ...inner } } = globalThis);
