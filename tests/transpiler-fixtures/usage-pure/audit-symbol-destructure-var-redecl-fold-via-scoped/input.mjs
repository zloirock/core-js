// NEGATIVE: a same-named UNBOUND read outside the alias's hosting scope is a runtime
// ReferenceError - the file-wide name-keyed registration must not serve it
function scopedAlias() {
  const { iterator: scopedIt = 0 } = Symbol;
  return [][scopedIt];
}
export const viaScoped = scopedAlias();
