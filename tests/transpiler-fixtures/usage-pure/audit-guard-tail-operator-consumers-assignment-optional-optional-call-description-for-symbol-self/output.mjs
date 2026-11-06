import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
import _descriptionMaybeSymbol from "@core-js/pure/actual/symbol/instance/description";
// slots that already delimit a whole expression keep the ternary BARE. `=` opens one only as a
// (compound) assignment, `>` only as an arrow - the negatives that pin the pair classification
let assigned;
assigned = null == _globalThis.window ? void 0 : _descriptionMaybeSymbol(_Symbol$for('x'));
export { assigned };