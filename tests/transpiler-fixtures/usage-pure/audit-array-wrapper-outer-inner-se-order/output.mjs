import _globalThis from "@core-js/pure/actual/global-this";
// Nested literal wrappers retain every outer and inner prefix in source order.
// Their static leaves remain native across declaration, assignment and for-init hosts.
function outerEffect() {
  return 1;
}
function innerEffect() {
  return 2;
}
function midEffect() {
  return 3;
}
const [{
  Array: {
    from
  }
}] = (outerEffect(), [(innerEffect(), _globalThis)]);
export const viaDouble = from([1]);
const [[{
  Array: {
    of
  }
}]] = (outerEffect(), [(midEffect(), [(innerEffect(), _globalThis)])]);
export const viaTriple = of(1, 2);
const keep = 1,
  [{
    Object: {
      groupBy
    }
  }] = (outerEffect(), [(innerEffect(), _globalThis)]),
  keep2 = 2;
export const viaSplit = groupBy([keep, keep2], x => x);
let fromAsync;
[{
  Array: {
    fromAsync
  }
}] = (outerEffect(), [(innerEffect(), _globalThis)]);
export const viaAssignment = fromAsync;