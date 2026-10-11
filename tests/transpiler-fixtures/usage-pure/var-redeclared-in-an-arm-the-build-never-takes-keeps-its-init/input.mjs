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
