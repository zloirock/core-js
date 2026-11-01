// A claimless for-init keeps its nested receiver and source default.
for (const { Array: { unknown } = fallback() } = globalThis; test(unknown);) {
  use(unknown);
}
