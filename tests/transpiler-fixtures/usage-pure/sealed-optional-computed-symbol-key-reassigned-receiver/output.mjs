import _getIterator from "@core-js/pure/actual/get-iterator";
var _ref;
// A sealed optional iterator lookup skips its key only for a nullish receiver.
// A source assignment in that key must not be mistaken for a generated receiver capture.
let arr = ['held'];
export const result = _getIterator(null == (_ref = arr) ? void 0 : (arr = ['swapped'], _ref)).next().value;