import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A caller-supplied receiver keeps its getter between the computed key and the sibling write.
export function read(input, log) {
  function mark(tag, value) {
    log.push(tag);
    return value;
  }
  let at, tail;
  [{
    [(mark('key'), 'at')]: at
  }, tail] = [mark('receiver', input), 7];
  return [at, tail];
}