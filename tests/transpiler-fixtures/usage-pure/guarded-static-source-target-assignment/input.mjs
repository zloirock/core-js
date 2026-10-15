// A split pattern can write into its own source binding before the next read.
// Every guard must read the original receiver rather than the overwritten name.
export function read(source) {
  let M = source;
  if (!M) M = Array;
  let tail;
  ({ of: M, from: tail } = M);
  return [M, tail];
}
