// A stored receiver uses the same guarded value in the loop header.
let held;
for (const { Map: { missing = fallback() } } = held = (record(), globalThis.window?.self); running(); ) {
  use(held, missing);
}
