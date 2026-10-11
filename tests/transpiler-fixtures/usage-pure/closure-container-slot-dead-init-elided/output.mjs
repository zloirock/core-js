import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Reflect from "@core-js/pure/actual/reflect";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// usage-pure keeps a written slot's read native, whether the write completes before the reading closure
// is created or the closure may run first, and guards no dead initial value of the slot
const plain = {
  C: Array
};
plain.C = Int16Array;
export const readPlain = () => plain.C.of(1);
const decided = {
  C: Object
};
if (typeof _Symbol != 'undefined') decided.C = _Map;
export const readDecided = () => decided.C.groupBy([1], x => x);
const afterClosure = {
  C: Object
};
export const readAfterClosure = it => afterClosure.C.getPrototypeOf(it);
afterClosure.C = _Reflect;
const hoisted = {
  C: Object
};
export const early = readHoisted(1);
hoisted.C = _Reflect;
export function readHoisted(it) {
  return hoisted.C.isExtensible(it);
}
const swapped = {
  C: Array
};
swapped.C = Uint8Array;
export const readSwapped = () => swapped.C.from([1]);
export function swap() {
  swapped.C = _Iterator;
}