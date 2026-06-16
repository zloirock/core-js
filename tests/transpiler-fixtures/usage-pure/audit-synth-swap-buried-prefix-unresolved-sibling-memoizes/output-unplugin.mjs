import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// a synth-swap receiver with a side effect buried along its spine (`(globalThis.c++, globalThis)`)
// and an UNRESOLVED sibling key (`isArray`, a native static with no pure entry): the literal cannot
// re-read the receiver for the unresolved key without re-running the buried effect, so the receiver
// is memoized through a function param and read once - rescuing AND re-reading would double-run it
function g({ from, isArray } = (function (_ref) { return { from: _Array$from, isArray: _ref.isArray }; })((_globalThis.c++, _globalThis).Array)) {
  return [from([1]), isArray([])];
}
g();