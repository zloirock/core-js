// a selection the build decides, standing in what a write installs or a pattern slot holds, yields its
// live operand alone: the dead one names no key and no constructor for the union
let key;
key = typeof Symbol != 'undefined' ? 'toSorted' : 'toReversed';
export const readKey = list => list[key]();
let Ctor;
Ctor = typeof Symbol != 'undefined' ? Reflect : Object;
export const readCtor = () => Ctor.getOwnPropertyDescriptor({ a: 1 }, 'a');
const { slotKey } = { slotKey: typeof Symbol != 'undefined' ? 'findLastIndex' : 'flatMap' };
export const readSlotKey = list => list[slotKey](x => x);
const { Slot } = { Slot: typeof Symbol != 'undefined' ? Iterator : Array };
export const readSlot = () => Slot.from([1]);
