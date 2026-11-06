// Statics nested under an array element retain their native source hops, defaults and rest exclusions.
// The initializer prefix runs once; independent push and hasOwn calls are still served.
const log = [];
const [{ Object: { keys, ...rest } }] = [(log.push('init'), globalThis)];
const [{ Object: { entries = log.push('default'), ...remaining } }, tail] = [globalThis, 1];
export const r = [keys({ a: tail }), entries({ b: 2 }), log, Object.hasOwn(rest, 'keys'), Object.hasOwn(remaining, 'entries')];
