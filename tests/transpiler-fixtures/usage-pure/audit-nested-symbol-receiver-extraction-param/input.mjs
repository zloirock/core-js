// NEGATIVE: a param host has no init to root the chain in
function param({ inner: { [Symbol.iterator]: fromParam } }) {
  return fromParam;
}
export { param };
