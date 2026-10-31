// a container reassigned before the closure reading its slot is defined holds the written one there,
// never the dead init - written unconditionally or under a test the build decides - so the init's
// static is not injected. a write the closure may observe after its definition keeps the init live
let plain = { C: Object };
plain = { C: Map };
export const readPlain = () => plain.C.groupBy([1], x => x);
let decided = { C: Array };
if (typeof Symbol != 'undefined') decided = { C: Iterator };
export const readDecided = () => decided.C.from([1]);
let afterClosure = { C: Int16Array };
export const readAfterClosure = () => afterClosure.C.of(1);
afterClosure = { C: Promise };
