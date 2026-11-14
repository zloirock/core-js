import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol from "@core-js/pure/actual/symbol";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  return (choice ? _Symbol : null == _globalThis.window ? void 0 : _Symbol).iterator in [3];
}