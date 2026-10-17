// The field scan collects what a method writes INSIDE the object (`this.<field> = ...`), but a method that passes `this` ON hands
// the receiver to code the scan cannot follow, and every write through it lands outside.
const handsOut = {
  rows: [1, 2],
  leak() {
    sink(this);
  },
  read() {
    return this.rows.at(0);
  }
};
handsOut.leak();
