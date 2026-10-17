import _Array$from from "@core-js/pure/actual/array/from";
function nestedSeqKeepsLiteral(f, g) {
  const {
    w: {
      Array: {
        from: viaNestedSeq
      }
    }
  } = {
    w: (f(), g(), {
      Array: {
        from: _Array$from
      }
    })
  };
  return viaNestedSeq;
}
export default [nestedSeqKeepsLiteral(() => 1, () => 2)];