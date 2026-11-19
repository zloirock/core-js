import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// A claim in a nested default does not activate an otherwise untouched outer hop.
for (const realm of [_globalThis]) {
  const {
    Array: {
      prototype: {
        at
      } = {
        at: _at(fallback())
      }
    }
  } = realm;
  use(at);
}