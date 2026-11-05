import _globalThis from "@core-js/pure/actual/global-this";
// A source conditional keeps its native pattern rather than becoming a residual anchor.
// Its native pattern and both possible receiver values remain observable.
const {
  Map: {
    missing
  }
} = test() ? void 0 : _globalThis;
export { missing };