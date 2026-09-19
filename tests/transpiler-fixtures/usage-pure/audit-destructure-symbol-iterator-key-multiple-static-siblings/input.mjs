// Object-rest keeps the affected method slots native; computed symbol keys still polyfill.
// Independent reads and key/default expressions still receive their own polyfills.
const { [Symbol.iterator]: it, from, of, ...rest } = globalThis.Array;
it;
from([1]);
of(2, 3);
export { it, from, of, rest };
