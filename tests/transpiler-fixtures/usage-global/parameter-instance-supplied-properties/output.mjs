// A known custom object keeps its own properties, including undefined values.
// A closed caller alone is not proof of an instance prototype receiver.
function read({
  at = fallback,
  flat
}) {
  return [at, flat];
}
export const result = read({
  at: undefined,
  flat: custom
});