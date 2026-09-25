import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a for-of head keeping a rest beside a static reads the static off the element; the rest is a copy
// of the element's own enumerable keys, so a static read off it stays raw and an `in` probe on it is
// no probe of the constructor - even where the head is relocated and its declarator re-spelled
const on = [1].length > 0;
for (const {
  from,
  ...rest
} of [Array]) console.log(from([1]), rest.of, 'isArray' in rest);
for (const {
  groupBy,
  ...others
} of [on ? Map : Map]) console.log(groupBy, others.groupBy);