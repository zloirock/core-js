// Object-rest keeps the affected pattern native, including inside an array wrapper.
// Independent reads and key/default expressions still receive their own polyfills.
const [{ 'from': f, [Symbol.iterator]: it, ...r }] = [Array];
f([1]);
it;
r;
