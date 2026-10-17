// a SEQUENCE the source wrote around the paired value owes its prefix: the dispatch spells the value
// the collapse takes, never the comma run in front of it, so the literal stays and runs it
function seqPrefixKeepsLiteral(bump) {
  const { w: { [Symbol.iterator]: viaPrefix } } = { w: (bump(), globalThis) };
  return viaPrefix;
}
export default [seqPrefixKeepsLiteral(() => 1)];
