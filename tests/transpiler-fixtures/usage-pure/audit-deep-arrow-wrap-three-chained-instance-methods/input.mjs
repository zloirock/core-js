// Deeply nested arrow body with chained instance methods - outer arrow wrap + 3 inner
// polyfills, all sharing the same root receiver: nested rewrites over one
// receiver chain must keep emission stable
const f = x => arr.flat().at(0).includes(1);
const g = x => arr.flat().findLast(p);
const h = x => arr.flat().findLastIndex(p);
