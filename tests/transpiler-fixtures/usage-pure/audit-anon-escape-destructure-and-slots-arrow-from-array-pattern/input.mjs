// Passing this object through the extracted value lets external code write its fields.
// Its method must therefore dispatch for both array and string receivers.
function take(sink, dyn) {
  const [fromArrayPattern] = [{ data: ['x'], read() { return this.data.at(0); } }];
  sink(fromArrayPattern);
}
take(x => x, 'k');
