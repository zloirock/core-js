// A visible iterator write keeps both computed and plain static reads native.
const events = [];
const original = Object.getOwnPropertyDescriptor(Array.prototype, Symbol.iterator);
const foreign = {
  of() { events.push('foreign-of'); return 'own-of'; },
  from() { events.push('foreign-from'); return 'own-from'; },
  get length() { events.push('length'); return 29; },
};
let result;
try {
  Array.prototype[Symbol.iterator] = function () {
    events.push('iterator');
    return {
      next() { events.push('next'); return { value: foreign, done: false }; },
      return() { events.push('close'); return { done: true }; },
    };
  };
  const [{ of: a, [(events.push('key'), 'from')]: b, length: c }] = [Array];
  result = [a(), b(), c];
} finally {
  Object.defineProperty(Array.prototype, Symbol.iterator, original);
}
export { result, events };
