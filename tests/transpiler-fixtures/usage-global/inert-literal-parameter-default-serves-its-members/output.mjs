import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.function.name";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.concat";
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
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// a parameter default spelled as an element of an INERT literal (`[Iterator][0]`, `[[1, 2]][0]`,
// `({ I: Iterator }).I`) serves the statics and instance members destructured off it, as the direct
// spelling does; a caller's own argument still destructures natively
function h1({
  from: s1,
  name: nm1
} = [Iterator][0]) {
  return [s1, nm1];
}
function h2({
  at: a2
} = [[1, 2]][0]) {
  return a2;
}
const h3 = ({
  concat: c3,
  name: nm3
} = {
  I: Iterator
}.I) => [c3, nm3];
use(h1, h2, h3);