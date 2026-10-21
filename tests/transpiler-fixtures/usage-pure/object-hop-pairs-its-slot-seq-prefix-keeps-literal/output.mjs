import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// A sole instance extraction may consume its literal wrapper.
// Its receiver still evaluates the slot prefix exactly once.
function seqPrefixKeepsLiteral(bump) {
  const viaPrefix = _getIteratorMethod((bump(), _globalThis));
  return viaPrefix;
}
export default [seqPrefixKeepsLiteral(() => 1)];