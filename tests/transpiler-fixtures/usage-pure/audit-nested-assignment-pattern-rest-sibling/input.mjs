// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
function run({ x: { from = [] } = Array, ...rest } = {}) {
  return [from([1]), rest];
}
function emit({ y: { of = () => null } = Array, ...rest } = {}) {
  return [of(2, 3), rest];
}
export { run, emit };
