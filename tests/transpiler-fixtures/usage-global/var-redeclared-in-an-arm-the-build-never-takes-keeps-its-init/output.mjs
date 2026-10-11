import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// a `var` redeclared in an arm this build never takes is never redeclared: a read below keeps the
// first declarator's value, while a re-declaration in an arm that may run leaves the read open
export function dead() {
  var value = 'abc';
  if (typeof Promise == 'undefined') {
    var value = [1];
  }
  return value.at(0);
}
export function live(flag) {
  var other = 'abc';
  if (flag) {
    var other = [1];
  }
  return other.includes(1);
}