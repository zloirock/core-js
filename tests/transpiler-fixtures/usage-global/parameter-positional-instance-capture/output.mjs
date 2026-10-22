import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
export function full([{
  at
}]) {
  return at.call([9], 0);
}
export function partial([{
  at,
  length
}] = [[4, 5]]) {
  return [at.call([9], 0), length];
}
export function supplied([{
  at,
  length
}]) {
  return [at.call([9], 0), length];
}