// the mutation census reads the same opaque accesses the type layer does: a direct `eval` can
// replace a container wholesale, so the static read THROUGH it deopts exactly as a written slot
// would - substituting the ponyfill there would hand back a method the replacement never carried.
// the negative pins the reach: a container inside a function is out of that call's scope chain
var opaque = { host: Array };
eval("opaque = { host: null }");
opaque.host.from([1]);
function scoped() {
  var kept = { host: Array };
  return kept.host.of(2);
}
