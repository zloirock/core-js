import _Symbol$dispose from "@core-js/pure/actual/symbol/dispose";
// The explicit Symbol.dispose key requests the pure import. The using declaration stays intact.
function makeResource() {
  return {
    [_Symbol$dispose]() {/* cleanup */}
  };
}
function f() {
  using r = makeResource();
  return r;
}
export { f };