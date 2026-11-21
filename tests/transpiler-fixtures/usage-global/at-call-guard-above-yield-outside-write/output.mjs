import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The driver writes before the generator starts. Its guard reads that new value on the first next().
// The ordinary function runs immediately and sees the value from before the write.
export function belowYield(v, extra) {
  let x = v;
  function* read() {
    if (typeof x === 'string') {
      yield 0;
      return x.at(0);
    }
    return null;
  }
  const steps = read();
  x = extra;
  return steps;
}
export function atomicBody(v, extra) {
  let y = v;
  function read() {
    if (typeof y === 'string') return y.includes('a');
    return null;
  }
  const done = read();
  y = extra;
  return done;
}