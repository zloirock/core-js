import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// a delete is an element write host
const gapped = [[1], [2]];
delete gapped[0];
export const viaDeleteWrite = _includes(_ref = gapped[0]).call(_ref, 2);