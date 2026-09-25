import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
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
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// a destructured parameter whose receiver default is a MEMBER of the file's own container - a class
// static field, a pure static getter, a literal's data slot - takes the static: pure mirrors the
// default on both legs, since the read of a pure member is no work the source did, and the mirror
// keeps a caller-supplied object; global injects the static
class Fields {
  static M = Map;
}
class Getters {
  static get P() {
    return Promise;
  }
}
const data = {
  I: Iterator
};
export function viaField({
  groupBy
} = Fields.M) {
  return groupBy;
}
export function viaGetter({
  try: attempt
} = Getters.P) {
  return attempt;
}
export function viaData({
  from
} = data.I) {
  return from;
}
// ... and a caller that supplies its own object still reads its own slot
export const supplied = viaData({
  from: 1
});