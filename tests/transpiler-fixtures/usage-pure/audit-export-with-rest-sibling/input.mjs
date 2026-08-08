// export-wrapped destructure with rest sibling: `export const { Array: { from }, ...rest }
// = globalThis;` - cascade emits `export const from = ...` for the extraction AND keeps
// `export const { ...rest } = _globalThis` for the residual rest gather. both bindings
// must be re-exported
export const { Array: { from }, ...rest } = globalThis;
[from, rest];
