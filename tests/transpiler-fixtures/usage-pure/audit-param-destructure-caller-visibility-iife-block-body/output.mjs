import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// Rewriting a parameter destructure is caller-lossy: a body-extract ignores what the caller passed, and an inline default fills a
// leaf the caller deliberately left undefined.
const G = _globalThis;
export const iifeBlockBody = (([{
  Map,
  Array: {
    of
  }
} = {
  Map: _Map,
  Array: {
    of: _Array$of
  }
}]) => {
  return [Map, of];
})([]);