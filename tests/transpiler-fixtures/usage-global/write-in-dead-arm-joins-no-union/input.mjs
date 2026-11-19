// a write in an arm the build never takes installs nothing, so the values a reassigned name may hold
// leave it out and its modules stay out - a key, a constructor, a container and a container slot written
// there. the live value still injects its own
let key = 'findLast';
if (typeof Symbol == 'undefined') key = 'flat';
export const readKey = list => list[key](x => x);
let Ctor = Map;
if (typeof Symbol == 'undefined') Ctor = Object;
export const readCtor = () => Ctor.groupBy([1], x => x);
let box = { C: Iterator };
if (typeof Symbol == 'undefined') box = { C: Array };
export const readBox = () => box.C.from([1]);
const holder = { C: Int16Array };
if (typeof Symbol == 'undefined') holder.C = Array;
export const readSlot = () => holder.C.of(1);
