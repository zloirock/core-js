// AssignmentPattern default with TaggedTemplateExpression on the right - the runtime value
// returned by `tag` is unknown to the resolver, so synth-swap can't rebuild the receiver.
// Inline-default emission also bails because the right side isn't a bare Identifier; the
// destructured `from` stays untouched and the ObjectPattern is left intact
function f({
  from
} = tag`whatever`) {
  return from;
}
export { f };