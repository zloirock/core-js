// Iterator extraction preserves the stored property value before applying its default.
// The getter runs once and rest excludes the iterator key without reading it again.
export function read(value) {
  let reads = 0, defaults = 0;
  const source = { get [Symbol.iterator]() { reads++; return value; }, extra: 7 };
  const { [Symbol.iterator]: method = (defaults++, 'fallback'), ...rest } = source;
  return [method, reads, defaults, rest.extra];
}
