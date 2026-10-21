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
var held;
let from;
({
  C: {
    from
  }
} = held = {
  C: Array
});
export { stash, held, from };