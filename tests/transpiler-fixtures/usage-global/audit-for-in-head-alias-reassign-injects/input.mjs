// for-in head variant: the head writes the alias P only when the object has enumerable keys; on the
// empty-object path P keeps its pre-loop value Promise, so the later call may dispatch on Promise and
// usage-global must still inject es.promise.all-settled (the head write does not dominate the use).
function f(o) {
  var P = Promise;
  for (P in o) {}
  P.allSettled([]);
}
