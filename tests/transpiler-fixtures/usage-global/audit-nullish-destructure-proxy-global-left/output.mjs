import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Regression trap (verified non-bug), usage-global companion: a proxy-global LEFT of `??` / `||`
// (`globalThis.Iterator ?? Array`) resolves to Iterator, whose polyfill is injected; the `?? Array`
// fallback is dead because core-js provides Iterator, so Array.from is NOT injected. The destructure
// pattern is pre-formatted multiline so both emitters byte-converge.
const {
  from
} = globalThis.Iterator ?? Array;
from([1, 2, 3]);