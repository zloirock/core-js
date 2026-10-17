import _Symbol from "@core-js/pure/actual/symbol";
// NEGATIVE: a multi-hop alias captures its source BEFORE the aliasing write - the registered
// write span must end before each hop's read, not before the eventual use
let HopSource;
const HopAlias = HopSource;
HopSource = _Symbol;
const {
  iterator: viaHop = fb
} = HopAlias;
export const aa = [43, 44][viaHop];