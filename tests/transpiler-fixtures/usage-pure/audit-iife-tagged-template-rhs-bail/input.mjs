// default-value param with a tagged template on the right: runtime value returned by
// `tag` is unknown, so the receiver cannot be classified. Per-key destructure-default
// emission also bails (right side is not a bare identifier); the destructured `from`
// stays untouched and the object destructure is left intact
function f({ from } = tag`whatever`) {
  return from;
}
export { f };
