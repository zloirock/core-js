import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.unscopables.flat";
// An assignment over a literal whose claimed slot runs code keeps a reader beside the claim - a sibling key
// ahead of it or behind it, a second slot that runs code, a deeper level: the literal is captured once,
// where the source builds it, and the claim reads its slot off the capture - in a statement, an unbraced
// body and a discarded sequence element.
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