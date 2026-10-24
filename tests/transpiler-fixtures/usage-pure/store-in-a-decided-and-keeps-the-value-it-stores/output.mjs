import _Map from "@core-js/pure/actual/map";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
var stash;
export const {
  C: {
    groupBy
  }
} = stash = {
  C: _Map
};
var kept;
let of;
({
  C: {
    of
  }
} = kept = {
  C: Array
});
export { stash, kept, of };