// Passing this object through the extracted value lets external code write its fields.
// Its method must therefore dispatch for both array and string receivers.
function take(sink, dyn) {
  let rest;
  [...rest] = [[{ deep: ['d'], grab() { return this.deep.at(2); } }]];
  sink(rest[0][0]);
}
take(x => x, 'k');
