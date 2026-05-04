import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.iterator";
// usage-global mode does NOT rewrite `Array.from` to `_Array$from`, so the alias-chain
// narrowing path through injector entry is irrelevant here. but the receiver narrowing
// MUST still happen via destructure path (`staticPairFromDestructure`) for unrewritten
// aliases. `const { from } = Array` keeps Array binding visible; arr.at must still pick
// the array-specific module side-effect import. lock that usage-global emission stays
// proper side-effect imports (no SE-wrap) for the downstream methods
const {
  from
} = Array;
const arr = from('hi');
arr.at(-1);
arr.findLast(x => x);
arr.flat();