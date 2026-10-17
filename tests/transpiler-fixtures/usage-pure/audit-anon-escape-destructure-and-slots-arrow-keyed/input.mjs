// Passing this object through the extracted value lets external code write its fields.
// Its method must therefore dispatch for both array and string receivers.
function take(sink, dyn) {
  const keyed = { [dyn]: { words: 'ab', ask() { return this.words.includes('a'); } } };
  sink(keyed[dyn]);
}
take(x => x, 'k');
