// A getter observes preceding array bindings and the uninitialized following binding.
// Neighbouring declarators retain their source evaluation order.
export function read(make) {
  const lead = 1, [before, { at }, after] = [2, make(() => [before, after]), 3], tail = 4;
  return [lead, before, at, after, tail];
}
