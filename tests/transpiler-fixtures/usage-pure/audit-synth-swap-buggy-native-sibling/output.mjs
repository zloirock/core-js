import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _globalThis from "@core-js/pure/actual/global-this";
// synthetic argument-receiver substitution next to a buggy-native-detected sibling:
// each sibling rewrites independently without interfering.
function f({
  resolve,
  custom
} = {
  resolve: _Promise$resolve,
  custom: _Promise.custom
}) {
  return [resolve(1), custom];
}
_globalThis.__call = () => f({
  resolve: x => x,
  custom: 'ok'
});