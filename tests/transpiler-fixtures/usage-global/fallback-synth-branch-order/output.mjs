import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
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
    return globalThis.Array;
  })() : {
    from: value => value,
    of: value => [value]
  });
  return [from([7])[0], of(8)[0], missing, log];
}