// The method read precedes its live forward default and the following binding.
// The default cannot replace a missing native instance polyfill on a supplied array.
export function read(factory, key) {
  const { [(key(), 'values')]: value = after, after } = factory();
  return [value, after];
}
