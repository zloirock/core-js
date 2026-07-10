import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a key read off an array-pattern REST (`[...{ at }]`) reads the REST ARRAY's property,
// not element 0's - the rest slice is provably an Array, so the Array entry injects
// (reading element 0 injected the string family and OMITTED es.array.at: ie:11 break)
const [...{
  at
}] = ['hello', 'world'];
export const viaRestKey = at;

// a whole-rest binding keeps its Array narrow for member dispatch (`includes` so the
// key-read line above uniquely owns the `at` entry in the import set)
const [...rest] = ['hello', 'world'];
export const viaRestIncludes = rest.includes('hello');