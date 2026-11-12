// An opaque iterator keeps inner-default reads inside its step, before IteratorClose.
// Its pattern stays native; pure mirrors the default to supply the static at that step.
// The receiver is a local iterable whose first step yields undefined.
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
