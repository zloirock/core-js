// a wrapped OPTIONAL callee refuses the guard machinery: no raw-branch bind is emitted, the member
// is left to the regular substitution path (pure bails when uncertain) and the optional call keeps
// caller-side `this`
export function viaOptional(c) {
  let O;
  if (c) ({ Object: O } = globalThis);
  return (O.groupBy)?.([1, 2], x => x % 2);
}
export const r = [viaOptional(true)];
