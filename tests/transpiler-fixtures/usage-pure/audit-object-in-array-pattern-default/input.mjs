// An array element in a parameter can be supplied or fall back to Array.
// Its supported selecting route serves from without changing when the default runs.
function f([{ from } = Array]) {
  return from([1, 2]);
}
f([Array]);
