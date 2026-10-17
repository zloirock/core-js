import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.get-own-property-descriptor";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a selection the build decides, standing in what a write installs or a pattern slot holds, yields its
// live operand alone: the dead one names no key and no constructor for the union
let key;
key = typeof Symbol != 'undefined' ? 'toSorted' : 'toReversed';
export const readKey = list => list[key]();
let Ctor;
Ctor = typeof Symbol != 'undefined' ? Reflect : Object;
export const readCtor = () => Ctor.getOwnPropertyDescriptor({
  a: 1
}, 'a');
const {
  slotKey
} = {
  slotKey: typeof Symbol != 'undefined' ? 'findLastIndex' : 'flatMap'
};
export const readSlotKey = list => list[slotKey](x => x);
const {
  Slot
} = {
  Slot: typeof Symbol != 'undefined' ? Iterator : Array
};
export const readSlot = () => Slot.from([1]);