// A sealed optional receiver must throw after evaluating the surviving key.
// The optional call cannot swallow the member read, and its argument stays skipped.
export const value = (globalThis.window?.Promise)[(key(), "noSuchStatic")]?.(argument());
