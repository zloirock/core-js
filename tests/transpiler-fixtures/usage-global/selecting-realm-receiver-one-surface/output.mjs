import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.push";
import "core-js/modules/es.array.species";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.map";
import "core-js/modules/web.self";
// a SELECTING receiver whose every branch names a global OBJECT reads one realm whichever branch
// runs, so the surface under it is the same on all of them and the claim narrows to the family that
// surface hosts. `&&` is not a selection of this kind - its left is the TEST and a falsy left is
// what the whole yields, so the read there stays native on both legs
const seen = [];
const pick = 1;
const {
  Array: {
    prototype: {
      at
    }
  }
} = pick ? globalThis : self;
const {
  Array: {
    prototype: {
      includes
    }
  }
} = self ?? globalThis;
const {
  Array: {
    prototype: {
      map
    }
  }
} = pick && globalThis;
seen.push(at, includes, map);
export { seen };