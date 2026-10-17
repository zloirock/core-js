let s;
export const computedLeafKey = (s = globalThis.window)?.self['Array'].prototype.at.call([1], 0);
