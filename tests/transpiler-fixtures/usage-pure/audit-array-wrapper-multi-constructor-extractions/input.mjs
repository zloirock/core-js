// Different constructors at each ArrayPattern-wrapped destructure: `Promise` -> `resolve`
// and `Map` -> `groupBy`. each binding extraction resolves through its dedicated constructor
// receiver, proving the static-extraction path accepts any capitalised global constructor,
// not just Array
const promiseWrap = [Promise];
const mapWrap = [Map];
const [{ resolve }] = promiseWrap;
const [{ groupBy }] = mapWrap;
resolve(1);
groupBy([1, 2, 3], x => x);
