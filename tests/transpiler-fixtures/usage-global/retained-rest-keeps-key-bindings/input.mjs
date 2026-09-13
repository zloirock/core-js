// Bound string keys and a well-known symbol keep their instance dispatch.
// Rest excludes all three consumed keys.
export function read(source) {
  const firstKey = 'at';
  const secondKey = 'flat';
  const { [firstKey]: first, [secondKey]: second, [Symbol.iterator]: iterator, ...rest } = source;
  return [first, second, iterator, rest];
}
