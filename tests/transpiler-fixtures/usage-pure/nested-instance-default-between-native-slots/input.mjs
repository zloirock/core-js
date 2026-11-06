// The nested instance read and its default run between the two outer getters.
export function read(fallback) {
  const { left, prototype: { at = fallback() }, right } = Array;
  return [left, at, right];
}
