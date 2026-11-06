import _globalThis from "@core-js/pure/actual/global-this";
// A claimless for-init keeps its nested receiver and source default.
for (const {
  Array: {
    unknown
  } = fallback()
} = _globalThis; test(unknown);) {
  use(unknown);
}