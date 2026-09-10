// the mutation census reads the same opaque accesses the type layer does: a direct `eval` can
// replace a container wholesale, so the read THROUGH it settles on no constructor and the static
// brings in no module of its own. the negative pins the REACH, which is what this file is for: a
// container inside a function is out of that call's scope chain and keeps its claim
var opaque = { host: Array };
eval("opaque = { host: null }");
opaque.host.from([1]);
function scoped() {
  var kept = { host: Array };
  return kept.host.of(2);
}
