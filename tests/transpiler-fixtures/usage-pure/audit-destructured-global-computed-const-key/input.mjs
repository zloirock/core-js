// a global destructured through a computed CONST key names the same proxy global a literal key does,
// so a chained instance method on its static result keeps the typed dispatch. without folding the
// const key, the receiver type degrades and the chained method falls back to a generic dispatch. the
// array-wrapped form folds the key inside the positional peel too. distinct method per line.
const arrKey = "Array";
const { [arrKey]: A } = globalThis;
const [{ [arrKey]: W }] = [globalThis];
export const r1 = A.from([1]).at(0);
export const r2 = W.of(2).includes(2);
