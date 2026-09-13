// Object-rest keeps the affected method slots native; computed symbol keys still polyfill.
// Independent reads and key/default expressions still receive their own polyfills.
const { [Symbol.iterator]: it, ...r } = c ? globalThis : self;
it;
r;
const { [Symbol.iterator]: it2, Array: { from: f } } = c ? globalThis : self;
it2;
f(x);
