// a synth-swap receiver with a side effect buried along its spine (`(globalThis.c++, globalThis)`)
// and an UNRESOLVED sibling key (`isArray`, a native static with no pure entry): the literal cannot
// re-read the receiver for the unresolved key without re-running the buried effect, so the receiver
// is memoized through a function param and read once - rescuing AND re-reading would double-run it
function g({ from, isArray } = (globalThis.c++, globalThis).Array) {
  return [from([1]), isArray([])];
}
g();
