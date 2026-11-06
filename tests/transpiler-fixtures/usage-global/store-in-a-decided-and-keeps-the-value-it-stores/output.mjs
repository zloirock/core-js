import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// usage-global reads a leaf through a store in a decided `&&` to the constructor in the stored literal's
// slot and loads its static, in a declaration and an assignment alike
var stash;
export const {
  C: {
    groupBy
  }
} = typeof Symbol != 'undefined' && (stash = {
  C: Map
});
var kept;
let of;
({
  C: {
    of
  }
} = typeof Symbol != 'undefined' && (kept = {
  C: Array
}));
export { of };