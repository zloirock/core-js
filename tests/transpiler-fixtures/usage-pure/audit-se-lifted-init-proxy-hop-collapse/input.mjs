// a lone-prop destructure whose init is RETAINED only for its side effect - the value is consumed by
// the polyfilled binding, no surviving sibling or rest reads it. the proxy-global member chain in that
// retained init must still collapse its intermediate hop (`globalThis.self.Array` -> `_globalThis.Array`)
// so the lifted statement does not read an undefined `.self` hop off-browser (ie:11 / Node). the
// collapse must NOT be gated on value-consumption. distinct methods so each line's import is unambiguous
let firstReads = 0;
let secondReads = 0;
let thirdReads = 0;
const { from: arrayFrom } = (firstReads++, globalThis.self.Array) || Set;
const { of: arrayOf } = (secondReads++, globalThis.self.Array) || Map;
// no `||` fallback: the receiver TAIL is pure and unread, so the lift drops it to a bare side-effect
// statement (`thirdReads++`). the proxy hop must NOT be collapsed here - the chain is already gone, and
// editing the dropped region would race the drop (a compose crash). exercises the surviving-tail gate
const { fromAsync: arrayFromAsync } = (thirdReads++, globalThis.self.Array);
export { arrayFrom, arrayOf, arrayFromAsync };
