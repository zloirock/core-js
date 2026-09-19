// Object-rest keeps the affected method slots native; computed symbol keys still polyfill.
// Independent reads and key/default expressions still receive their own polyfills.
const { Array: { [Symbol.iterator]: a } } = globalThis;
a;
const { Map: { [Symbol.iterator]: m } } = globalThis;
m;
const { Object: { [Symbol.iterator]: o, fromEntries: fe } } = globalThis;
o;
fe(x);
const { Set: { [Symbol.iterator]: s, ...ri } } = globalThis;
s;
ri;
