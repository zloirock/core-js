import _at from "@core-js/pure/actual/instance/at";
function dfl(a = [1]) {
  return a;
}
const viaDefaultAlias = dfl(...wrapped);
_at(viaDefaultAlias).call(viaDefaultAlias, 0);
export { viaDefaultAlias };