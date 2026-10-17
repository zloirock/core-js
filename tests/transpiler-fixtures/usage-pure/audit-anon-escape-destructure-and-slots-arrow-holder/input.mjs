// Passing this object through the extracted value lets external code write its fields.
// Its method must therefore dispatch for both array and string receivers.
function take(sink, dyn) {
  const holder = {};
  holder.f = { marks: 'mn', test() { return this.marks.includes('m'); } };
  sink(holder.f);
}
take(x => x, 'k');
