// Object-rest keeps the affected method slots native; computed symbol keys still polyfill.
// Independent reads and key/default expressions still receive their own polyfills.
const { self: { [Symbol.iterator]: it, ...rest } } = globalThis;
it;
export { it, rest };
