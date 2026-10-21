// Shared capture and receiver-default routes preserve independently supported claims.
// Supplied values and defaults keep their source branches and independent claims.
function f([{ from } = Array]) {
  return from([1, 2]);
}
f([Array]);
