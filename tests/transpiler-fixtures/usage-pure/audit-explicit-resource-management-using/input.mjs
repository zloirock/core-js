// The explicit Symbol.dispose key requests the pure import. The using declaration stays intact.
function makeResource() {
  return {
    [Symbol.dispose]() { /* cleanup */ },
  };
}
function f() {
  using r = makeResource();
  return r;
}
export { f };
