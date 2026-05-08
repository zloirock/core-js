// Parameter destructure `function f({ from, ...rest } = Array)` mixes static dispatch with rest semantics.
// `from` must be lifted to a body-local polyfill alias while preserving the rest behaviour at runtime.
function build({ from, ...rest } = Array) {
  const xs = from('xy');
  return xs.at(0) + xs.findLast(p => p) + xs.flat().length;
}
export { build };
