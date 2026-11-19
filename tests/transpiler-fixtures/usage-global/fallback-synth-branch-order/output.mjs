import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
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
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Each selected receiver contributes its own static family; dead operands stay unobserved.
export function read(pick, nested) {
  const log = [];
  const {
    from,
    of,
    missing = (log.push('default'), 9)
  } = (log.push('before'), pick
  // The selected leaf registers before its dead right is removed.
  ? nested ? (log.push('array'), Array) || (log.push('dead'), Object) : (() => {
    log.push('call');
    return globalThis.Iterator;
  })() : {
    from: value => value,
    of: value => [value]
  });
  return [from([7])[0], of(8)[0], missing, log];
}