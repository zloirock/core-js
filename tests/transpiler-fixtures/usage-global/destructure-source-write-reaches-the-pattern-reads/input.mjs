// a destructure evaluates its source before the pattern reads anything, so a write in the source reaches
// the pattern's defaults and computed keys: they read what the source stored, and pure keeps both
// candidates. defaults run in order, so a write in a later default stays out of an earlier one
let C;
C = Map;
const { a = C.groupBy(xs, f) } = (C = Object, obj);
let D;
D = Array;
const { [D.from(ys).length]: v } = (D = Iterator, obj);
let E;
E = Promise;
const { p = E.try(f), q = (E = Object) } = obj;
