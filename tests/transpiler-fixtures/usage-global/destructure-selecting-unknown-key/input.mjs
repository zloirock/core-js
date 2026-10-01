// An unknown key retains its own read between independently guarded named statics.
export function read(source, key) {
  const { from, [key]: other, of = 17 } = source || Array;
  return [from, other, of];
}
