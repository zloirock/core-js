import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
class Reader {
  static read(source) {
    return source.from([1])[0];
  }
}
const instance = new Reader();
export function read(key) {
  const custom = {
    value: 9,
    from() {
      return [this.value];
    }
  };
  return [Reader.read(Array), instance[key].read(custom)];
}
export const result = read("constructor");