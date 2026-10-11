// a slot written before the closure reading it is created holds the written constructor there, written
// unconditionally or under a test the build decides, so the dead initial value's static is not injected.
// a closure that may run before the write keeps it - one created above the write, a function declaration
// (created when its scope is entered) - and writes that disagree, one in another function, keep every
// value, the dead init included
const plain = { C: Array };
plain.C = Int16Array;
export const readPlain = () => plain.C.of(1);
const decided = { C: Object };
if (typeof Symbol != 'undefined') decided.C = Map;
export const readDecided = () => decided.C.groupBy([1], x => x);
const afterClosure = { C: Object };
export const readAfterClosure = it => afterClosure.C.getPrototypeOf(it);
afterClosure.C = Reflect;
const hoisted = { C: Object };
export const early = readHoisted(1);
hoisted.C = Reflect;
export function readHoisted(it) {
  return hoisted.C.isExtensible(it);
}
const swapped = { C: Array };
swapped.C = Uint8Array;
export const readSwapped = () => swapped.C.from([1]);
export function swap() {
  swapped.C = Iterator;
}
