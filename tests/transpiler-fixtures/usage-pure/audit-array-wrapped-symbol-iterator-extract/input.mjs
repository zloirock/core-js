// Object-rest keeps the affected method slots native; computed symbol keys still polyfill.
// Independent reads and key/default expressions still receive their own polyfills.
const [{ [Symbol.iterator]: it, ...r }, tail] = [arr, 0];
it;
r;
tail;
const [{ [Symbol.iterator]: single }] = [other];
single;
