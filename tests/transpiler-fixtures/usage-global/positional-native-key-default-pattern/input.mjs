// Native fragments retain their keys, defaults and nested patterns around a positional read.
export function read(rows, key, fallback) {
  const [{ [key]: other = fallback(), nested: { value }, at, includes = fallback() }] = rows;
  return [other, value, at, includes];
}
