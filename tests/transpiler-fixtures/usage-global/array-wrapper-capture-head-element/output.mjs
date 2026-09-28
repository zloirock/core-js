import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a retained capture of an array wrapper over a loop-head binding declares every captured slot:
// the key-effect claim beside a plain static resolves through the capture it was moved onto
const log = [];
const out = [];
for (const e of [Array]) {
  const [{
    [(log.push('k'), 'of')]: of,
    from
  }] = [e];
  out.push(of, from);
}
export { out, log };