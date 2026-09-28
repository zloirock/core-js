// A selected static stays paired with its loop element: alone it mirrors the selected arm in place,
// and beside an instance claim the pattern moves into the body and still reads that arm.
export function read(flag, user) {
  for (const { w: [{ is }] } of [{ w: [flag ? Object : user] }]) return is;
}
export function readBeside(flag, user) {
  for (const { w: [{ is }], v: { at } } of [{ w: [flag ? Object : user], v: [1, 2] }]) return [is, at];
}
