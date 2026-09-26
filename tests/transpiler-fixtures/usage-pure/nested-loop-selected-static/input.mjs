// A selected static stays paired with its loop element after the nested pattern moves into the body.
export function read(flag, user) {
  for (const { w: [{ is }] } of [{ w: [flag ? Object : user] }]) return is;
}
