// A guarded default before a native sibling preserves an assignment's value.
// The default can rebind the source; the remaining pattern still reads the original.
export function read(source) {
  let M = source;
  if (!M) M = Array;
  let method, extra;
  const result = ({ of: method = (M = {}, 9), extra } = M);
  return [method, extra, result === source];
}
