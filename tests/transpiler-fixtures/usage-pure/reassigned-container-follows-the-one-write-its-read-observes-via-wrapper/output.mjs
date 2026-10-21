import _Promise from "@core-js/pure/actual/promise";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
let rw5 = [{
  p: Object
}];
rw5 = [{
  p: _Promise
}];
const [{
  p: {
    race: viaWrapper
  }
}] = rw5;
export { viaWrapper };