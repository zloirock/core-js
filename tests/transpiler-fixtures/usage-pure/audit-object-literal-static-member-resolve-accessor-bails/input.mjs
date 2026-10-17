// a getter winning the key is a dynamic value -> bail (native)
export function accessorBails() {
  const ns = { get R() { return Set; } };
  const { R: { union } } = ns;
  return union;
}
