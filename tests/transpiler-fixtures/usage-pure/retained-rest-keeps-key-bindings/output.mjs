import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
export function read(source) {
  const firstKey = 'at';
  const secondKey = 'flat';
  const {
    [firstKey]: first,
    [secondKey]: second,
    [_Symbol$iterator]: iterator,
    ...rest
  } = source;
  return [first, second, iterator, rest];
}