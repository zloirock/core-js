// the reassignment of the Promise alias comes AFTER the use, so the init value is still live at the
// call - a later write can't change what the use read. usage-global resolves it and injects
// es.promise.all-settled. distinct domination branch from the conditional case: the write here is
// unconditional but simply does not textually precede the use.
function f(other) {
  var P = Promise;
  P.allSettled([]);
  P = other;
}
