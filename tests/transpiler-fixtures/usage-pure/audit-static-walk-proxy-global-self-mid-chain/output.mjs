import _self from "@core-js/pure/actual/self";
// A literal namespace holding self keeps its native nested Map.groupBy read.
// The self reference is still served independently.
const ns = {
  root: _self
};
const {
  root: {
    Map: {
      groupBy
    }
  }
} = ns;
export const grouped = groupBy([1, 2, 3], n => n % 2);