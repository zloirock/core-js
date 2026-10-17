import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
const arrowBody = () => null == _globalThis.window ? void 0 : _Object$entries({
  a: 1
}).length;
export const arrowValue = arrowBody();