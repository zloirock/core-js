// Capturing a stored constructor must not read the setter target back.
export function read(choice, box) {
  const A = choice ? Array : null;
  return (box.value = A)?.from([3]);
}
