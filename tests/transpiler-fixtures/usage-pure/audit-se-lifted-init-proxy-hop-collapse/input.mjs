// a lone-prop destructure whose init is lifted only for its side effect: no sibling or rest reads the
// value, so the receiver - a `.self` hop absent off-browser - is never read. a `||` left the build
// serves (`Array`, and `Number`, a global core-js extends in place) leaves its fallback dead, so the
// lift keeps the effect alone, exactly as it does with no fallback at all
let firstReads = 0;
let secondReads = 0;
let thirdReads = 0;
const { from: arrayFrom } = (firstReads++, globalThis.self.Array) || Set;
const { of: arrayOf } = (secondReads++, globalThis.self.Array) || Map;
const { fromAsync: arrayFromAsync } = (thirdReads++, globalThis.self.Array);
export { arrayFrom, arrayOf, arrayFromAsync };
let fourthReads = 0;
const { isInteger: numberIsInteger } = (fourthReads++, globalThis.self.Number) || WeakSet;
export { numberIsInteger };
