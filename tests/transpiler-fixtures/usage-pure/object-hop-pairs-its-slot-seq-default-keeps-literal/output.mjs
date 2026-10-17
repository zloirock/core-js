import _Map from "@core-js/pure/actual/map";
function seqDefaultKeepsLiteral(f) {
  const {
    w: {
      Map: viaSeqDefault
    }
  } = {
    w: (f(), {
      Map: _Map
    })
  };
  return viaSeqDefault;
}
export default [seqDefaultKeepsLiteral(() => 1)];