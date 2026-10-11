// an install of a dispatching prototype reaches a read of the binding only where it may run before it: a
// read ahead of it in a loop body comes after it on the next pass, so `at` dispatches on both families. the
// loop brings the iteration modules
const looped = [1, 2];
for (const x of xs) {
  use(looped.at(x));
  Object.setPrototypeOf(looped, String.prototype);
}
