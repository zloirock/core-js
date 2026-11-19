import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.array.values";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// A `var` initializer runs where the source declares it: past an earlier write of its name it is the later write,
// in a straight line or in a block, and a read below it does not take the earlier value. A write past the
// initializer still decides.
export function straight() {
  list = 'ab';
  const head = list.at(-1);
  var list = [3, 4];
  return [head, list.includes(3)];
}
export function blocked(flag) {
  list = [1].values();
  if (flag) {
    var list = [3, 4];
  }
  return list.find(x => x);
}
export function control() {
  var list = [3, 4];
  list = [1].keys();
  return list.filter(x => x);
}