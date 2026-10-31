// A visible realm getter write keeps a foreign constructor hop native and reads it once.
const events = [];
const original = Object.getOwnPropertyDescriptor(globalThis, 'Array');
const foreign = {
  of() { events.push('foreign-of'); return 'own-of'; },
  from() { events.push('foreign-from'); return 'own-from'; },
  get length() { events.push('length'); return 29; },
};
let result;
try {
  Object.defineProperty(globalThis, 'Array', {
    configurable: true,
    get() { events.push('realm'); return foreign; },
  });
  const [{ Array: { of: a, [(events.push('key'), 'from')]: b, length: c } }] = [globalThis];
  result = [a(), b(), c];
} finally {
  Object.defineProperty(globalThis, 'Array', original);
}
export { result, events };
