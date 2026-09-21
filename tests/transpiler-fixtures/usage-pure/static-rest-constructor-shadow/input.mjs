// A local constructor namesake keeps the supplied object and its properties.
export function read(Promise) {
  const { all, ...rest } = Promise;
  return [all, rest];
}
