// `_ref` is read as an undeclared global (set on globalThis). plugin's ref allocator
// must account for such sloppy globals so its generated ref names don't collide - the
// user's global write must be treated as a reservation even though there's no local
// `_ref` binding declaration
globalThis._ref = { x: 5 };
console.log(_ref.x);
[1, 2, 3].at(0);
// a READ-only slot key reserves the name the same way - the temp must not alias it
console.log(globalThis._ref2);
// a STRING-key write has no member spelling for the key scan; the mutated-slot names
// still reserve it
Object.defineProperty(self, '_ref3', { value: 1 });
export const f = [4, [5]].flat();
// a proxy-HOP spelling names the same user slot through the alias - reserved the same way
console.log(globalThis.self._ref4);
export const g = [6, 7].at(-1);
// a computed STRING-key spelling folds to the same slot name - reserved too
console.log(globalThis['_ref5']);
export const h = [8, [9]].flat(2);
