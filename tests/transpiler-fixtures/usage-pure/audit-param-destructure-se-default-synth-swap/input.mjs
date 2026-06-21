// param destructure with SE-tail default: `({from} = (0, Array)) => from(...)`. without
// peeling the SE tail, the default resolves to a SequenceExpression and synth-swap bails
// back to inline-default `{from = _Array$from}`. peeling strips the harmless prefix `0`,
// recognizes the inner `Array`, and synth-swap emits the clean `{from: _Array$from}` shape
function probe({ from } = (0, Array)) {
  return from([1, 2]);
}
probe();
