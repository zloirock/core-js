// a selection of a name and other values is decided by its own binding: a namesake selection in an unrelated
// function, recorded first and storing nothing, does not keep this one whole, so a constructor written
// through its alias reaches the named container and a static read back loads the constructor's static
export function a(flag, x1) {
  const v = flag ? x1 : { C: Set };
  return v;
}
export function b(flag) {
  const listed = { C: Array };
  const v = flag ? listed : { C: Set };
  const w = v;
  w.C = Iterator;
  return listed.C.from([1]);
}
