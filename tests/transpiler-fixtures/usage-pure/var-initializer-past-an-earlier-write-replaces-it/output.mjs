import _at from "@core-js/pure/actual/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A `var` initializer runs where the source declares it: past an earlier write of its name it is the later write,
// in a straight line or in a block, and a read below it does not take the earlier value. A write past the
// initializer still decides.
export function straight() {
  list = 'ab';
  const head = _atMaybeString(list).call(list, -1);
  var list = [3, 4];
  return [head, _at(list).call(list, -1)];
}
export function blocked(flag) {
  list = 'ab';
  if (flag) {
    var list = [3, 4];
  }
  return _at(list).call(list, -1);
}
export function control() {
  var list = [3, 4];
  list = 'ab';
  return _atMaybeString(list).call(list, -1);
}