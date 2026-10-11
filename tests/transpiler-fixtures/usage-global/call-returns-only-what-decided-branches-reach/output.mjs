import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.species";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// A call yields only what a return this build runs hands back: a return in an arm the build never
// takes returns nothing, and one after an `if` whose arm the build always takes and which always
// leaves never runs. An undecided test keeps every return.
function live(source) {
  if (typeof Promise != 'undefined') return 'abc';
  return source;
}
function dead() {
  if (typeof Promise == 'undefined') return [1];
  return 'abc';
}
function nested(source) {
  {
    if (typeof Promise != 'undefined') {
      return 'abc';
    }
  }
  return source;
}
function undecided() {
  if (globalThis.flag) return 'abc';
  return [1];
}
export const fromLive = live(input).at(0);
export const fromDead = dead().includes('b');
export const fromNested = nested(input).concat('d');
export const fromUndecided = undecided().slice(1);