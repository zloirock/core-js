import "core-js/modules/es.object.assign";
// the receiver alias M is UNCONDITIONALLY reassigned to a global before the use, so the init `{}` is
// dead and M is provably Object at the call. usage-global recovers the reaching receiver from the
// reassignment (not the dead init) and injects es.object.assign.
function f() {
  var M = {};
  M = Object;
  return M.assign({}, {
    a: 1
  });
}