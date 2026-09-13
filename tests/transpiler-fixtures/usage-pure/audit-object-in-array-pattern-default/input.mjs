// The parameter consumes `from` from its supplied array element or its default.
// Both paths need the static method when the native Array.from is absent.
function f([{ from } = Array]) {
  return from([1, 2]);
}
f([Array]);
