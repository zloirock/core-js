import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Positional instance parameters use their supplied slot, with defaults and residual length preserved.
export function full([{
  at
}]) {
  return at.call([9], 0);
}
export function partial([{
  includes,
  length
}] = [[4, 5]]) {
  return [includes.call([9], 9), length];
}
export function supplied([{
  map,
  length
}]) {
  return [map.call([9], value => value), length];
}