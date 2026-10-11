// A container write a later unconditional write overwrites before a closure reading through it is even
// defined installs nothing the closure observes: in usage-global the static its slot names stays out. A
// write after the closure's definition may run before a call, so it stays
let box = { C: null };
box = { C: Object };
box = { C: Map };
export const closureRead = () => box.C.groupBy([1], x => x);
let late = { C: null };
export const lateRead = () => late.C.from([1]);
late = { C: Array };
late = { C: Iterator };
