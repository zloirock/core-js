import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A setter target receives the source realm before the static extraction.
const source = {
  set realm(value) {
    mark(value);
  }
};
source.realm = _globalThis;
export const read = _Array$of;