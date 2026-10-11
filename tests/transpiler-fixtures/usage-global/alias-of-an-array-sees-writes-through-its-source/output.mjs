import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
// an alias of an array reads the elements its source holds, so a write through the source - a mutator,
// an element write, a hand-out - reaches a read through the alias too, through a decided selection or
// not; an alias of a source nothing writes keeps the element narrow
export function shifted() {
  const source = ['abc'];
  const list = source;
  source.unshift([1]);
  return list[0].flat();
}
export function written() {
  const source = ['abc'];
  const list = typeof Promise != 'undefined' ? source : [];
  source[0] = [1];
  return list[0].findLastIndex(Boolean);
}
export function handedOut(fill) {
  const source = ['abc'];
  const list = source;
  fill(source);
  return list[0].findLast(Boolean);
}
export function untouched() {
  const source = ['abc'];
  const list = source;
  return list[0].at(0);
}