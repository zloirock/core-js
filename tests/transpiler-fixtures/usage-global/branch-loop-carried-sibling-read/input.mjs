// Different loop iterations can take opposite arms and share the outer binding.
// Keep both receiver families: the read can observe the previous iteration's array.
export function read(flags) {
  let value = 'ab';
  const result = [];
  for (const flag of flags) {
    if (flag) value = ['a', 'b'];
    else result.push(value.includes('a,b'));
  }
  return result;
}
