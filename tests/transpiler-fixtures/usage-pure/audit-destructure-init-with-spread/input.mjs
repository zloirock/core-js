// destructure init with `...someObj` spread: Proxy traps on `someObj` may have side
// effects, so the init can't be elided even when no properties match a polyfill
const { from } = { ...someObj, from: Array.from };
globalThis.__r = from([1, 2]);
