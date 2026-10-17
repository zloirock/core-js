import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// Rewriting a parameter destructure is caller-lossy: a body-extract ignores what the caller passed, and an inline default fills a
// leaf the caller deliberately left undefined.
const G = _globalThis;
export const objectMethod = {
  m([{
    Map: M,
    Array: {
      from: f
    }
  } = {
    Map: _Map,
    Array: {
      from: _Array$from
    }
  }]) {
    return [M, f];
  }
};