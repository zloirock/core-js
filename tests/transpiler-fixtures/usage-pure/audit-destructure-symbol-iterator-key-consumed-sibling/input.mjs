// Object-rest keeps the affected method slots native; computed symbol keys still polyfill.
// Independent reads and key/default expressions still receive their own polyfills.
const { [Symbol.iterator]: it, from, ...rest } = globalThis.Array;
it;
from([1]);
export { it, from, rest };
