import _globalThis from "@core-js/pure/actual/global-this";
// A source-written conditional is not a guard created by this transform.
// Its native pattern and both possible receiver values remain observable.
const {
  Map: {
    missing
  }
} = test() ? void 0 : _globalThis;
export { missing };