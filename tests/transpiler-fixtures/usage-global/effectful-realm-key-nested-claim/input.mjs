// Global detection keeps the source access and still detects both the key and static leaf claims.
const effects = [];
export const value = (globalThis[(effects.push('key'), 'window')]?.self).Array.of(2);
export { effects };
