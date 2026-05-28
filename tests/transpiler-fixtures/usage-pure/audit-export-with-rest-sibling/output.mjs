import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
export const from = _Array$from;
// export-wrapped destructure with rest sibling: `export const { Array: { from }, ...rest }
// = globalThis;` - cascade emits `export const from = ...` for the extraction AND keeps
// `export const { ...rest } = _globalThis` for the residual rest gather. both bindings
// must be re-exported
export const {
  Array: _unused,
  ...rest
} = _globalThis;
[from, rest];