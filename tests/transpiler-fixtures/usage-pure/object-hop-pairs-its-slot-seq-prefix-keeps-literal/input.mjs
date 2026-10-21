// A sole instance extraction may consume its literal wrapper.
// Its receiver still evaluates the slot prefix exactly once.
function seqPrefixKeepsLiteral(bump) {
  const { w: { [Symbol.iterator]: viaPrefix } } = { w: (bump(), globalThis) };
  return viaPrefix;
}
export default [seqPrefixKeepsLiteral(() => 1)];
