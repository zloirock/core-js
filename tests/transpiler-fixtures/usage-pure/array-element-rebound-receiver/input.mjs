// A property getter may replace a later element's source binding.
// Extraction still reads the value captured before destructuring started.
export function read(first, second) {
  let later = second;
  const earlier = first(() => { later = replacement(); });
  const [{ at }, { includes }] = [earlier, later];
  return [at, includes];
}
