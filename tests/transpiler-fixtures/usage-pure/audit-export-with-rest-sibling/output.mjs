import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// an exported destructure with a rest sibling splits into an exported extraction and a kept rest
// level: the claimed static leaves the pattern as an exported binding of its own, while the rest keeps
// its source with the claimed key as an exclusion, so it copies the keys the source copies.
export const from = _Array$from;
const {
  Array: _unused,
  ...rest
} = _globalThis;
export { rest };
[from, rest];