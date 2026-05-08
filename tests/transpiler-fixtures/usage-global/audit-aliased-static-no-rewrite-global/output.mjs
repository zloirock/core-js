import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.iterator";
// usage-global mode keeps `Array.from` unrewritten, but receiver narrowing through the
// destructure (`const { from } = Array`) still has to fire so subsequent instance calls
// emit array-specific side-effect imports rather than generic instance ones
const {
  from
} = Array;
const arr = from('hi');
arr.at(-1);
arr.findLast(x => x);
arr.flat();