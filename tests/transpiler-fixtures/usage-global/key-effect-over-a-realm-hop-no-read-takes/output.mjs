import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a computed key consuming the whole declaration over a realm hop no read takes owes the hop only what
// discarding it runs - the effect in its object or in its key, its own claims rendered - ahead of the key,
// and the constructor the hop names leaves with its import
// usage-global rewrites nothing: the realm reads load `globalThis`, the `Map` and `Iterator` reads their
// constructor families, `groupBy`, `from` and `log.push` their own modules
export const log = [];
export const {
  [(log.push('k1'), 'groupBy')]: groupBy
} = (log.push('i1'), globalThis).Map;
export const {
  [(log.push('k2'), 'from')]: from
} = globalThis[log.push('i2'), 'Iterator'];