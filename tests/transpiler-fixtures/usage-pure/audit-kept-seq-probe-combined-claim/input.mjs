// a combined ctor claim (an instance read off the pure ctor) whose receiver is a sequence-carried
// environment probe under a live `?.`: the ordinary split owns it - the sequence rides the guard
// test whole and the combined render the alternate. the instance route used to stand down over the
// harvested prefix and no inner claim could re-drive it, shipping the claim raw with no polyfill.
const g = globalThis;
let c = 0, d = 0;
export const nestedSeq = (d++, (c++, globalThis.window))?.Map.name;
export const singleSeq = (d++, globalThis.window)?.Map.name;
// an instance claim ABOVE a call still owns the chain: both prefixes stay in its guard
// and the alias root folds to the stable leaf ponyfill. The call result keeps its own
// receiver capture for the trailing instance dispatch.
export const callThenAt = (d++, (c++, g.self))?.foo().at(0);
export const callThenAtDirect = (d++, (c++, globalThis.self))?.foo().at(0);

// NEGATIVE: the bare spelling has no harvested prefix and always took the split
export const bareTwin = globalThis.window?.Map.name;
