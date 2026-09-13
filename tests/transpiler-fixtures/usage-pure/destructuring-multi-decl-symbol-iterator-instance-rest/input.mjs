// Object-rest keeps the affected method slots native; computed symbol keys still polyfill.
// Independent reads and key/default expressions still receive their own polyfills.
const { [Symbol.iterator]: iter } = a, { includes, ...rest } = b;
