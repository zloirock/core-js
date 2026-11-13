// A guarded argument with a stored base keeps its methods and nullish branch.
// Global preserves the source; this row guards the injection surface.
let held;
export const result = (({ resolve }) => resolve)((held = globalThis.window)?.Promise);
