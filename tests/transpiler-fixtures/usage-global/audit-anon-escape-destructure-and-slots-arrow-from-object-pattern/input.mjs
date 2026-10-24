// Passing this object through the extracted value lets external code write its fields.
// Its method must therefore dispatch for both array and string receivers.
function take(sink, dyn) {
  const { x: fromObjectPattern } = { x: { tags: 'xy', scan() { return this.tags.includes('x'); } } };
  sink(fromObjectPattern);
}
take(x => x, 'k');
