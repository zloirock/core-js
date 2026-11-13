// A guarded argument with a stored base keeps its methods and nullish branch.
let held;
export const result = (({ resolve }) => resolve)((held = globalThis.window)?.Promise);
