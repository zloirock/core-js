// Computed-key instance claims retain their modules when the key has effects.
// The global method keeps the source destructure and its evaluation order intact.
export function read(factory, key) {
  const { [(key(), 'at')]: value } = factory();
  return value;
}
export function loop(factory, key) {
  for (let { [(key(), 'values')]: value } = factory();;) return value;
}
