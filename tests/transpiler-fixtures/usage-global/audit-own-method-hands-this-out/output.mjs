import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.string.at";
// the field scan collects what a method writes INSIDE the object (`this.<field> = ...`), but a
// method that passes `this` ON hands the receiver to code the scan cannot follow, and every write
// through it lands outside. a method that only READS `this` opens no such channel. the body need not be written
// here either: a spread copies another object's own methods in, and calling one runs it with this
// receiver. that row reads its field with a method carried by the ITERATOR family as well, so its
// verdict stays apart from the two above
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
const readsOnly = {
  cells: [1, 2],
  size() {
    return this.cells.length;
  },
  read() {
    return this.cells.includes(1);
  }
};
readsOnly.size();
const viaSpread = {
  ...source,
  slots: [1, 2],
  read() {
    return this.slots.find(x => x);
  }
};
viaSpread.borrowed();