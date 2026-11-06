import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// A loop initializer keeps the excluded receiver guard before its residual default.
// No body or update runs when the initializer throws.
for (const {
  missing = fallback()
} = (record(), (null == _globalThis.window ? void 0 : _globalThis.self).Map); test(missing); next()) use(missing);

// A stored receiver uses the same guarded value in the loop header.
let held;
for (const {
  missing = fallback()
} = (held = (record(), _globalThis.window?.self), held === _globalThis ? _Map : held.Map); running();) {
  use(held, missing);
}