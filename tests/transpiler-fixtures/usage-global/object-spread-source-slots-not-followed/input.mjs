// A spread can publish the constructors stored on its sources. An inherited slot
// and an own property of the copied object are distinct sources.
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
