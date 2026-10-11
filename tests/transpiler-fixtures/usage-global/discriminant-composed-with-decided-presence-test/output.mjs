import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.concat";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a discriminant check composed with a presence test this build always answers narrows by the part
// of the test that runs: a test always false leaves `||` to its right, a test always true leaves `&&`
// to it, a decided conditional its live arm, an exit's too - and a write to the discriminant after it
// drops the narrow as it would after the bare check. a test always true over `||` and an undecided one
// narrow nothing
type Box = {
  kind: 'text';
  data: string;
} | {
  kind: 'list';
  data: number[];
};
type Store = {
  kind: 'map';
  data: Map<string, number>;
} | {
  kind: 'list';
  data: number[];
};
declare const flag: boolean;
export function either(box: Box) {
  if (typeof Promise == 'undefined' || box.kind === 'text') return box.data.at(0);
}
export function exit(box: Box) {
  if (typeof Promise != 'undefined' && box.kind !== 'text') return;
  return box.data.includes('b');
}
export function exitConditional(store: Store) {
  if (typeof Promise != 'undefined' ? store.kind !== 'map' : flag) return;
  return store.data.forEach(log);
}
export function rewritten(box: Box, other: Box) {
  if (typeof Promise == 'undefined' ? flag : box.kind === 'text') {
    box.kind = other.kind;
    return box.data.slice(1);
  }
}
export function alwaysTrue(box: Box) {
  if (typeof Promise != 'undefined' || box.kind === 'text') return box.data.concat('d');
}
export function undecided(box: Box) {
  if (flag || box.kind === 'text') return box.data.flat();
}