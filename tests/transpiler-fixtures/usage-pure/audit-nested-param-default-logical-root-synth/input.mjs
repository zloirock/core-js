// a fallback-logical ROOT (`globalThis || self`) collapses LEFT into the mirrored default -
// the left branch short-circuits the selection on every engine where it is defined, same
// contract as the flat synth and the declarator flatten
function f({ Array: { from } } = globalThis || self) {
  return from;
}
export { f };
