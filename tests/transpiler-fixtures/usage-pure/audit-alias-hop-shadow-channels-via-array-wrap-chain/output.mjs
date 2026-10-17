import _Array$from from "@core-js/pure/actual/array/from";
// array-WRAPPED alias whose hop is shadowed by a param
const wrapRoot = Array;
const wrapLink = wrapRoot;
export function viaArrayWrapChain(wrapRoot) {
  const [{
    from
  }] = [{
    from: _Array$from
  }];
  return from([1]);
}