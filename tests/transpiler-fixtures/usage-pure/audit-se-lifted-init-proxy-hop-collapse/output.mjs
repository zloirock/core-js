import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
// a lone-prop destructure whose init is lifted only for its side effect - no surviving sibling or rest
// reads the value - must not read an undefined `.self` hop off-browser (Node): a `||` left the build
// serves (`Array`, and `Number`, a global core-js extends in place) leaves its fallback dead, so the lift
// keeps the effect alone and no hop
let firstReads = 0;
let secondReads = 0;
let thirdReads = 0;
firstReads++;
const arrayFrom = _Array$from;
secondReads++;
const arrayOf = _Array$of; // no `||` fallback: the receiver TAIL is pure and unread, so the lift drops it to a bare side-effect
// statement (`thirdReads++`). the proxy hop must NOT be collapsed here - the chain is already gone, and
// editing the dropped region would race the drop (a compose crash). exercises the surviving-tail gate
thirdReads++;
const arrayFromAsync = _Array$fromAsync;
export { arrayFrom, arrayOf, arrayFromAsync };
let fourthReads = 0;
fourthReads++;
const numberIsInteger = _Number$isInteger;
export { numberIsInteger };