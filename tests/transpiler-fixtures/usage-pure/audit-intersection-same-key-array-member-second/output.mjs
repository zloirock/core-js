import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// a key declared in several intersection constituents contributes the INTERSECTION of its
// per-constituent member types, not the first hit: `(WithMeta & WithRows).values` is
// `Meta & number[]`, an array, so `.at` narrows to the array variant even though the non-array
// `Meta` member is the first constituent. first-constituent-wins would drop the array member
interface Meta {
  count: number;
}
interface WithMeta {
  values: Meta;
}
interface WithRows {
  values: number[];
}
declare const data: WithMeta & WithRows;
_atMaybeArray(_ref = data.values).call(_ref, -1);