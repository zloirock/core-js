// Global detection keeps the optional access and detects the independent claim in its key.
const effects = [];
export const value = (globalThis.window?.[(effects.push('key'), 'self')]).customQ;
export { effects };
