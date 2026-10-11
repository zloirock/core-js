// a function declaration is created when its scope is entered, so a call ahead of a write reads what
// the binding held before it: the modules of both values stay - for a constructor, for a key, and for
// a write a later one overwrites after a second call. a function first used after the write reads the
// written value alone
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
let lateCtor = Object;
lateCtor = Map;
export const late = readLate();
export function readLate() {
  return lateCtor.groupBy([1], x => x);
}
let twice = Math;
twice = Array;
export const first = readTwice();
twice = Int16Array;
export const second = readTwice();
twice = Math;
export function readTwice() {
  return twice.of(1);
}
