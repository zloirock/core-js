// a function declaration is created when its scope is entered, so a call ahead of a write reads what
// the binding held before it: a write, or an agreeing branch pair, between that call and the
// declaration settles nothing for the reads inside it. a function first used after the write reads the
// written value
let Ctor = Iterator;
export const early = readCtor();
Ctor = Array;
export function readCtor() {
  return Ctor.from([1]);
}
let key = 'flat';
export const earlyKey = readKey([[1]]);
if (flag) key = 'at';
else key = 'at';
export function readKey(list) {
  return list[key](0);
}
let lateCtor = Iterator;
lateCtor = Array;
export const late = readLate();
export function readLate() {
  return lateCtor.of(1);
}
