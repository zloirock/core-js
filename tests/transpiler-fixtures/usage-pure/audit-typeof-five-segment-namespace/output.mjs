import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// extreme-depth namespace stress: 5 segments. walkStatementsForDecl recurses
// segment-by-segment via slice(moduleSegs.length); confirms the recursion handles
// deep structures without stack issues or off-by-one errors.
declare namespace L1 {
  namespace L2 {
    namespace L3 {
      namespace L4 {
        function fn(): number[];
      }
    }
  }
}
const r: ReturnType<typeof L1.L2.L3.L4.fn> = [];
_atMaybeArray(r).call(r, 0);