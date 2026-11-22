import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
var _ref;
// Updating a BigInt binding leaves a value that can be formatted as a string.
let count = BigInt(1);
const next = count++;
const repr = _padStartMaybeString(_ref = String(next)).call(_ref, 5, '0');
export { repr };