// A visible late return accessor keeps IteratorClose around the original native reads.
const events = [];
const rawArray = Function('return Array')();
const iteratorPrototype = Object.getPrototypeOf([][Symbol.iterator]());
const previousReturn = Object.getOwnPropertyDescriptor(iteratorPrototype, 'return');
const previousSibling = Object.getOwnPropertyDescriptor(rawArray, 'fc551ParameterSibling');
Object.defineProperty(rawArray, 'fc551ParameterSibling', {
  configurable: true,
  get() {
    events.push('sibling');
    Object.defineProperty(Object.getPrototypeOf([][Symbol.iterator]()), 'return', {
      configurable: true,
      get() {
        events.push('return');
        return function () { events.push('close'); return { done: true }; };
      },
    });
    return 17;
  },
});
function read([{ of, [(events.push('key'), 'from')]: from, length, fc551ParameterSibling: sibling }] = [Array]) {
  return [of(3)[0], from([4])[0], length, sibling];
}
let result;
try { result = read(); } finally {
  if (previousReturn) Object.defineProperty(iteratorPrototype, 'return', previousReturn);
  else delete iteratorPrototype.return;
  if (previousSibling) Object.defineProperty(rawArray, 'fc551ParameterSibling', previousSibling);
  else delete rawArray.fc551ParameterSibling;
}
export { result, events };
