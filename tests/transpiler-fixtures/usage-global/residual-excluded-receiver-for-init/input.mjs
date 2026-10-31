// A loop initializer keeps the excluded receiver guard before its residual default.
// No body or update runs when the initializer throws.
for (const { Map: { missing = fallback() } } = (record(), globalThis.window?.self); test(missing); next()) use(missing);

// A stored receiver uses the same guarded value in the loop header.
let held;
for (const { Map: { missing = fallback() } } = held = (record(), globalThis.window?.self); running(); ) {
  use(held, missing);
}
