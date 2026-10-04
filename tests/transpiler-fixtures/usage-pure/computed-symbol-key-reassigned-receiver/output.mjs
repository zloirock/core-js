import _getIterator from "@core-js/pure/actual/get-iterator";
var _ref;
// A computed symbol key changes a mutable receiver binding after its value is selected.
// Iterator consumption captures that value before key effects and calls its iterator once.
let arr = ['held'];
export const result = (_ref = arr, arr = ['swapped'], _getIterator(_ref)).next().value;