import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.concat";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.species";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// An element written under a presence test this build always answers takes the type the test
// settles: a write in the arm the build always takes is unconditional, one in the arm it never
// takes leaves the literal element. An undecided test keeps both values, and so does a `||` over
// an alias of a global the build does not know, which may hold a falsy value.
export function live() {
  const list = [[1]];
  if (typeof Promise != 'undefined') list[0] = 'abc';
  return list[0].at(0);
}
export function dead() {
  const list = ['abc'];
  if (typeof Promise == 'undefined') list[0] = [1];
  return list[0].includes('b');
}
export function undecided() {
  const list = [[1]];
  if (globalThis.flag) list[0] = 'abc';
  return list[0].slice(1);
}
const config = APP_CONFIG;
export function aliasLeft() {
  const list = ['abc'];
  config || (list[0] = [1]);
  return list[0].concat('d');
}