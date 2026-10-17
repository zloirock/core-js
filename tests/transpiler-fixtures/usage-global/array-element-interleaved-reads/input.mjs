// Native siblings stay between distinct claimed property reads.
// Repeated keys keep separate getter results.
export function read(receiver) {
  const [{ at: first, other, at: second, includes }] = [receiver];
  return [first, other, second, includes];
}
