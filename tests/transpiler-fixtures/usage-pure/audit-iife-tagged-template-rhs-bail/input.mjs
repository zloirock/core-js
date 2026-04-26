// AssignmentPattern default with TaggedTemplateExpression on the right: runtime value
// returned by `tag` is unknown, so the receiver cannot be classified. inline-default
// emission also bails (right side is not a bare Identifier); the destructured `from`
// stays untouched and the ObjectPattern is left intact
function f({ from } = tag`whatever`) {
  return from;
}
export { f };
