// an object SPREAD and a `__proto__` member are routes the census does not follow: a read through
// the copy or through the prototype names no value, so usage-global injects none of the statics read
// there, only the constructors themselves, while usage-pure keeps the whole entry of every constructor
// a spread hands out and leaves the `__proto__` route native
const src = { M: Map };
const copy = { ...src };
copy.M.groupBy(list, fn);
const inline = { ...{ P: Promise } };
inline.P.try(fn);
const pending = { M: Promise };
const overridden = { ...pending, M: Object };
overridden.M.allSettled(list);
const iterators = { I: Iterator };
const nested = { w: { ...iterators } };
nested.w.I.from(list);
const proto = { __proto__: { A: Array } };
proto.A.of(1);
