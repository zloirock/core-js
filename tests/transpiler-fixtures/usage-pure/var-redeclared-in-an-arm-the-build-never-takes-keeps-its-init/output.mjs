import _includes from "@core-js/pure/actual/instance/includes";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a `var` redeclared in an arm this build never takes is never redeclared: a read below keeps the
// first declarator's value, while a re-declaration in an arm that may run leaves the read open
export function dead() {
  var value = 'abc';
  if (typeof _Promise == 'undefined') {
    var value = [1];
  }
  return _atMaybeString(value).call(value, 0);
}
export function live(flag) {
  var other = 'abc';
  if (flag) {
    var other = [1];
  }
  return _includes(other).call(other, 1);
}