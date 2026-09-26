// Nested statics keep their source hops and object-rest exclusions.
// The initializer prefix runs once before the extracted bindings.
const log = [];
const [{ Object: { keys, ...rest } }] = [(log.push('init'), globalThis)];
const [{ Object: { entries = log.push('default'), ...remaining } }, tail] = [globalThis, 1];
export const r = [keys({ a: tail }), entries({ b: 2 }), log, Object.hasOwn(rest, 'keys'), Object.hasOwn(remaining, 'entries')];
