import _globalThis from "@core-js/pure/actual/global-this";
// A sole realm element retains its native Set property read and construction.
// The known positional hint does not itself synthesize a constructor wrapper.
const [{
  Set: S
}] = [_globalThis];
export const viaSingleGlobal = new S(singleSeed);