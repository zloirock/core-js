let k;
// An optional consumer observes the stored probe value, so the store retains window.
export const storedFolds = (k = globalThis.self.window)?.Map.length;
export { k };
