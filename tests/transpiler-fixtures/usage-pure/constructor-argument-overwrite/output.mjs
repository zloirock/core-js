import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise";
// An argument overwritten before its first read needs only its constructor entry.
// A value handed to another function before the overwrite still carries its statics.
const replacement = {
  value: 7
};
const chosen = (arg => {
  arg = replacement;
  return arg;
})(_Map);
const observed = (arg => {
  hand(arg);
  arg = replacement;
  return arg;
})(_Promise);
export { chosen, observed };