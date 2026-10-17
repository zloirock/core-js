let keyCount = 0;
export const computedKeyRoot = (() => globalThis)()?.window?.Object[(keyCount++, 'values')]({ b: 2 }).includes(2);
