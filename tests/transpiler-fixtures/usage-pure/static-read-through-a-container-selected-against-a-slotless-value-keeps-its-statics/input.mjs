// a selection of a container and a value with no slot - nullish, a primitive, an `&&`'s falsy left - reads a
// static off the container wherever the read does not throw, so the constructor the container holds keeps its
// statics, whether the read stands on the selection, a pattern over it, an alias of its slot or a nested slot
const nul = flag ? { C: Map } : null;
export const grouped = nul.C.groupBy([1], x => x);
const anded = flag && { P: Promise };
export const settled = anded.P.allSettled([]);
const { S } = flag ? { S: Symbol } : 0;
export const registered = S.for('a');
const empty = flag ? { I: Iterator } : '';
const I = empty.I;
export const copied = I.from([1]);
const nested = flag ? { w: { U: URL } } : false;
export const valid = nested.w.U.canParse('a:b');
