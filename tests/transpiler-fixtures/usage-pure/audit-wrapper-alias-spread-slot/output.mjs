import _globalThis from "@core-js/pure/actual/global-this";
// a spread at the wrapper alias's own declarator makes the slot's value union incomplete: the
// lone enumerable candidate is not what the runtime may hand the slot, so the pure follow
// declines and the destructure stays native - only the proxy-global literal itself rewrites
const xs = [];
const [wrapper] = [...xs, [_globalThis]];
export const [{
  Object: {
    fromEntries: viaSpread
  }
}] = wrapper;
export const spreadResolved = viaSpread([["k", 1]]);