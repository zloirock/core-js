import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
// a lone-prop destructure whose init is lifted only for its side effect: no sibling or rest reads the
// value, so the receiver - a `.self` hop absent off-browser - is never read. a `||` left the build
// serves (`Array`, and `Number`, a global core-js extends in place) leaves its fallback dead, so the
// lift keeps the effect alone, exactly as it does with no fallback at all
let firstReads = 0;
let secondReads = 0;
let thirdReads = 0;
firstReads++;
const arrayFrom = _Array$from;
secondReads++;
const arrayOf = _Array$of;
thirdReads++;
const arrayFromAsync = _Array$fromAsync;
export { arrayFrom, arrayOf, arrayFromAsync };
let fourthReads = 0;
fourthReads++;
const numberIsInteger = _Number$isInteger;
export { numberIsInteger };