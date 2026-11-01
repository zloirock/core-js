import _globalThis from "@core-js/pure/actual/global-this";
// A native rest-bearing leaf keeps its original nested pattern and loop receiver.
for (const realm of [_globalThis]) {
  const {
    Array: {
      prototype: {
        at,
        ...rest
      }
    }
  } = realm;
  use(at, rest);
}