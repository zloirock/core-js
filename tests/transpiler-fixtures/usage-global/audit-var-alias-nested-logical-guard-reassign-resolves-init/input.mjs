// the Promise alias is reassigned inside a NESTED logical short-circuit (`a && b && (P = other)`),
// which runs only when both a and b are truthy - so the init stays live on every other path and
// usage-global must inject es.promise.all-settled. the guard walk records the nested LogicalExpression
// right operands; the use escapes them, so the reassignment does not dominate.
function f(a, b, other) {
  var P = Promise;
  a && b && (P = other);
  P.allSettled([]);
}
