// Passing this object through the extracted value lets external code write its fields.
// Its method must therefore dispatch for both array and string receivers.
function take(sink, dyn) {
  let reassigned;
  [reassigned] = [{ nums: [1], pick() { return this.nums.at(1); } }];
  sink(reassigned);
}
take(x => x, 'k');
