// A subtype can add a symbol property with an array value beside a string index signature.
const key = Symbol('rows');
function read<T extends Record<string, string>>(o: T, k: keyof T) {
  return o[k].includes('a');
}
export const result = read({ name: 'test', [key]: ['ab'] }, key);
