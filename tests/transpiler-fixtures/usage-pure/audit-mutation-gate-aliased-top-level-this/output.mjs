import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a `this` captured at top level IS the realm object, and a write THROUGH the capture runs from
// wherever the file puts it - so the context question is anchored at the DECLARATION, not at the
// write. asking the write's own frame skipped every patch written this way (the UMD idiom), and
// the ponyfill was substituted over it. the negative sits below: a `this` captured INSIDE a
// function is the call's receiver, names no realm, and its writes taint nothing
const xs = [];
const g = this;
function install() {
  g.Array.from = patch;
}
install();
Array.from(xs);
function local() {
  const inner = this;
  inner.Map.groupBy = patch;
}
_Map$groupBy(xs, it => it);