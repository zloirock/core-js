// an explicit store through a binding the alias classes tie to a member path, in a file whose census drops
// a write an inert setter swallows: the written record is finished before either reducer reads it, so both
// legs load the stored constructor's static for a read back through the path, whichever reducer runs first
function swap(target) {
  target.M = Map;
  return target;
}
use(swap({ get M() { return Object; }, set M(value) {} }));
const R = { inner: { C: Object } };
let q = R.inner;
let m = R;
m = flag ? q : { C: Set };
m.D = 1;
Object.assign(m, { C: Iterator });
export const copied = R.inner.C.from([1]);
