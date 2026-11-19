// an open selection with a `Reflect` arm reads the static off whichever arm it holds, and that arm is the
// namespace pure swaps whole, so it brings its whole entry - held by a name, spelled in place, in a
// branching slot or behind a bare alias. A selection the build decides and a name holding `Reflect`
// alone are served by name.
const R = flag ? Reflect : Object;
export const viaAlias = R.getPrototypeOf(x);
export const inPlace = (flag ? Reflect : Object).getOwnPropertyDescriptor(x, 'k');
const box = { C: flag ? Reflect : Object };
export const inSlot = box.C.isExtensible(x);
const bare = Reflect;
const viaBare = flag ? bare : Object;
export const throughBare = viaBare.preventExtensions(x);
const D = typeof Reflect != 'undefined' ? Reflect : Object;
export const decided = D.has(x, 'k');
const sole = Reflect;
export const control = sole.ownKeys(x);
