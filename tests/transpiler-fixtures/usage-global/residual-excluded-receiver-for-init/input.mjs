// A loop initializer keeps the excluded receiver guard before its residual default.
// No body or update runs when the initializer throws.
for (const { Map: { missing = fallback() } } = (record(), globalThis.window?.self); test(missing); next()) use(missing);
