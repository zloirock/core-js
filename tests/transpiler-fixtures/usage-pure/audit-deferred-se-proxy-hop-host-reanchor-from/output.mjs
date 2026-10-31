import _Array$from from "@core-js/pure/actual/array/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a RESOLVABLE leaf folds to the same bare extraction on both emitters (statement vs
// paren-wrapped expression is a print-only divergence)
let picked;
({
  Map: {
    groupBy: picked
  }
} = {
  Map: {
    groupBy: _Map$groupBy
  }
});
export const from = _Array$from;
export { picked };