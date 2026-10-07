// a lone-prop destructure whose init is lifted only for its side effect - no surviving sibling or rest
// reads the value - must not read an undefined `.self` hop off-browser (Node): a `||` left the build
// serves (`Array`, and `Number`, a global core-js extends in place) leaves its fallback dead, so the lift
// keeps the effect alone and no hop
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
let fourthReads = 0;
const { isInteger: numberIsInteger } = (fourthReads++, globalThis.self.Number) || Set;
export { numberIsInteger };
