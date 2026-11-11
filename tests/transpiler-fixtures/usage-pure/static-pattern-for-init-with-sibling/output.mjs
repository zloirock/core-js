import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A pattern-valued static stays an extraction beside a live loop-head sibling.
export function read(key) {
  for (const {
      length
    } = _Array$from, {
      [key]: other
    } = _globalThis.Array;;) return [length, other];
}