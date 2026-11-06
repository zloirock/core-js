import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A destructuring assignment whose value is read still reads each claim off its element: an array level
// loads the instance method and the static its slots name, flat or under a keyed level.
let at, first, groupBy, includes;
export const viaInstance = [{
  at
}] = [[1, 2]];
export const viaStatic = [first, {
  groupBy
}] = [use(), Map];
export const viaKeyedLevel = {
  W: [{
    includes
  }]
} = {
  W: [[3]]
};
export { at, first, groupBy, includes };