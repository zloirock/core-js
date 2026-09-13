// A later unconditional var declaration overwrites an earlier conditional alias.
// Its static read follows the later value even when the host binds the first declaration.
export function read(flag) {
  if (flag) { var { Promise: M } = globalThis; }
  var { Map: M } = globalThis;
  return typeof M.groupBy;
}
