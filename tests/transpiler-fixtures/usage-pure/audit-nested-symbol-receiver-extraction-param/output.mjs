import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// NEGATIVE: a param host has no init to root the chain in
function param({
  inner: {
    [_Symbol$iterator]: fromParam
  }
}) {
  return fromParam;
}
export { param };