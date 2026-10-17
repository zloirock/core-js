import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set";
// Rewriting a parameter destructure is caller-lossy: a body-extract ignores what the caller passed, and an inline default fills a
// leaf the caller deliberately left undefined.
const G = _globalThis;
export const iifeArrow = (([{
  Set,
  Array: {
    from
  }
} = {
  Set: _Set,
  Array: {
    from: _Array$from
  }
}]) => [Set, from])([]);