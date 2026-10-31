// The source prefix runs before the guard; the key only runs inside it.
const log = [];
const { of } = (log.push('prefix'), globalThis.window?.[(log.push([7].at(0)), 'Array')]);
export const result = [of(3), log];
