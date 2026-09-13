// Each literal element supplies its own static; the custom element and head names survive.
export function read() {
  const seen = [];
  for (var { from } of [Array, { from: 'mine' }]) seen.push(typeof from);
  for (let { from } of [{ from: 'first' }, Array]) seen.push(typeof from);
  for (const { from } of [Array, { from: undefined }]) seen.push(typeof from);
  return seen;
}
