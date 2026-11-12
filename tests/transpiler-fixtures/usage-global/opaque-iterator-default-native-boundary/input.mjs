// An opaque iterator keeps inner-default reads inside its step, before IteratorClose.
// Global mode keeps the pattern and injects the named static.
// The local iterable yields undefined, selecting the receiver default.
const events = [];
const iterable = {
  [Symbol.iterator]() {
    return {
      next() { return { done: false, value: undefined }; },
      return() { events.push('close'); return {}; },
    };
  },
};
const [{ Array: { of }, [(events.push('key'), 'missing')]: value } = globalThis] = iterable;
use(of, value, events);
