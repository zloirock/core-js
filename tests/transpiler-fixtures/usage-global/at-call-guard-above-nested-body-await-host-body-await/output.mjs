import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
export function hostBodyAwait(v, extra) {
  let y = v;
  async function read() {
    if (typeof y === 'string') {
      await 0;
      return y.at(0);
    }
    return null;
  }
  const done = read();
  y = extra;
  return done;
}