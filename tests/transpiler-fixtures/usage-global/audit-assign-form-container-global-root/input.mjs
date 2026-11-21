// A trusted assignment can carry the realm into a static call and a closed subclass.
let arrayBox;
([arrayBox] = [globalThis]);
let objectBox;
({ k: objectBox } = { k: globalThis });
export const r1 = arrayBox.Array.from([1]);
export const r2 = objectBox.Array.of(2);
class C extends arrayBox.Promise { static m() { return super.any([1]); } }
export const inherited = C.m();
