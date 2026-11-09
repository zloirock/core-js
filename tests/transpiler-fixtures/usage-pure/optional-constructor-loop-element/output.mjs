import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// An optional constructor element keeps its native rejection and its static namespace.
for (const {
  resolve
} of [null == _globalThis.window ? void 0 : _Promise]) use(resolve);