import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.unscopables.flat";
// Literal assignments keep initializer effects ahead of nested method reads and preserve sibling order.
// Quiet trailing values can be assigned directly; other effectful slots and preceding sibling reads
// retain the required source value. Statement, unbraced body and sequence hosts keep that order.
const list = [3, [1, 2]];
function make() {
  return [1, 2];
}
let at, after, includes, twin, findLast, guarded, toSorted, kept, seq, before, findLastIndex;
({
  y: {
    at
  },
  o: after
} = {
  y: list.flat(),
  o: 1
});
({
  y: {
    includes
  },
  z: twin
} = {
  y: make(),
  z: make()
});
if (list) ({
  y: {
    findLast
  },
  o: guarded
} = {
  y: new Array(1, 2),
  o: 2
});
seq = ({
  x: {
    y: {
      toSorted
    }
  },
  o: kept
} = {
  x: {
    y: make()
  },
  o: 3
}, 5);
({
  o: before,
  y: {
    findLastIndex
  }
} = {
  o: 4,
  y: make()
});
export { at, after, includes, twin, findLast, guarded, toSorted, kept, seq, before, findLastIndex };