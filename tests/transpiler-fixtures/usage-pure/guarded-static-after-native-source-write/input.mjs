// A native sibling writes the source binding before the static guard runs.
// The guard still reads the original receiver captured by the destructuring assignment.
export function read(source) {
  let M = source;
  if (!M) M = Array;
  let method;
  ({ extra: M, of: method } = M);
  return method;
}
