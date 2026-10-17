// array-WRAPPED alias whose hop is shadowed by a param
const wrapRoot = Array;
const wrapLink = wrapRoot;
export function viaArrayWrapChain(wrapRoot) {
  const [{ from }] = [wrapLink];
  return from([1]);
}
