// An effectful realm key stays behind its source optional test.
// The sealed read still throws on an absent realm; its nested key claim stays live.
const effects = [];
export const value = (globalThis.window?.[(effects.push('key'), 'self')]).customQ;
export { effects };
