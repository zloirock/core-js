// A `var` initializer runs where the source declares it: past an earlier write of its name it is the later write,
// in a straight line or in a block, and a read below it does not take the earlier value. A write past the
// initializer still decides.
export function straight() {
  list = 'ab';
  const head = list.at(-1);
  var list = [3, 4];
  return [head, list.includes(3)];
}
export function blocked(flag) {
  list = [1].values();
  if (flag) {
    var list = [3, 4];
  }
  return list.find(x => x);
}
export function control() {
  var list = [3, 4];
  list = [1].keys();
  return list.filter(x => x);
}
