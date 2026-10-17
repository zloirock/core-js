import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a SEQUENCE the source wrote around the paired value owes its prefix: the dispatch spells the value
// the collapse takes, never the comma run in front of it, so the literal stays and runs it
function seqPrefixKeepsLiteral(bump) {
  const viaPrefix = _getIteratorMethod(_globalThis);
  const {
    w: {
      [_Symbol$iterator]: _unused
    }
  } = {
    w: (bump(), _globalThis)
  };
  return viaPrefix;
}
export default [seqPrefixKeepsLiteral(() => 1)];