// a call that hands its argument straight back (`id(Map)`) stores that argument, so a constructor written by
// one through a selection of a name and a literal lands on the name's container, and one written through a
// member alias of a container leaves with the container: either owes the written constructor's family
const id = value => value;
const box = { C: Object };
const either = flag ? box : { C: Set };
either.C = id(Map);
export const grouped = box.C.groupBy([1], x => x);
const nest = { inner: { C: Object } };
const inner = nest.inner;
inner.C = id(Promise);
use(nest);
