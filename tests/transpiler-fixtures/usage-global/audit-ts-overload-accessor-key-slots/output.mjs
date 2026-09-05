import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// member NAME slots must not inject: a bodyless overload signature key, an `abstract` method key and an
// `abstract accessor` key are all source-text names, so a global-shaped one pulls in nothing of its own.
// each key names a global that is used NOWHERE else in the file, so its polyfill appearing in the
// import-set would prove a false positive; the real usages on the last lines are the positive control.
// distinct method per line.
class Over {
  Set(): void;
  Set(x?: number) {}
}
abstract class AbsMethod {
  abstract WeakMap(): void;
}
abstract class AbsAcc {
  abstract accessor Promise: number;
}
export const r1 = new Map();
export const r2 = [[1], [2]].flat();
export { Over, AbsMethod, AbsAcc };