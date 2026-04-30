// param destructure with SE-tail default: `({from} = (0, Array)) => from(...)`. without
// SE-tail peel in `findTargetPath`, `wrapper.right` resolved to SequenceExpression and
// synth-swap bailed back to inline-default `{from = _Array$from}`. with `unwrapSequenceTail`
// the harmless prefix `0` is stripped, the inner `Array` is recognized, and synth-swap
// emits the clean `{from: _Array$from}` shape
function probe({ from } = (0, Array)) {
  return from([1, 2]);
}
probe();
