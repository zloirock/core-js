// `make: typeof helper` indirectly inherits `() => string[]` via the typeof query.
// Call-return resolution must follow the typeof binding so the result narrows to Array.
declare function helper(): string[];
declare const make: typeof helper;
const arr = make();
arr.at(0);
arr.findLast(x => x);
