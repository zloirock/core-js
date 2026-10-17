// A presence test the build always answers takes one arm on every path: the write there is the key's value, and the fallback the
// other arm spells never runs - in either order of the arms, and over a fallback init, and a dead fallback written after the read
// - a PATTERN writing it too, over an init and over a plain write alike.
let liveElse;
if (typeof Symbol == 'undefined') liveElse = '@@iterator';
else liveElse = Symbol.iterator;
export const readLiveElse = receiver => receiver[liveElse];
