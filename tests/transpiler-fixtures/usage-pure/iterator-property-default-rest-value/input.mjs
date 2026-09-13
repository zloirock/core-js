// Object-rest keeps the affected method slots native; computed symbol keys still polyfill.
// Independent reads and key/default expressions still receive their own polyfills.
export function read(value) {
  let reads = 0, defaults = 0;
  const source = { get [Symbol.iterator]() { reads++; return value; }, extra: 7 };
  const { [Symbol.iterator]: method = (defaults++, 'fallback'), ...rest } = source;
  return [method, reads, defaults, rest.extra];
}
