// Function rest param wrapping ArrayPattern wrapping ObjectPattern with default Map:
// `function f(...[a, {entries} = Map])`. walkPatternIdentifiers must recurse:
// RestElement -> ArrayPattern -> elements[1]=AssignmentPattern -> left=ObjectPattern
// -> Property.value=Identifier(entries). All bindings should be registered as locals
// for shadow-detection. The destructure path itself does not run for the inner
// AssignmentPattern (its parent is ArrayPattern, not VariableDeclarator/AssignmentExpression),
// so no Map.entries polyfill emits via destructure. Verifies rest+array+object combination
// does not crash detection or emit spurious polyfills.
function f(...[a, { entries } = Map]) {
  return [a, entries];
}
export { f };
