// The instance getter reads before the following rest binding is initialized.
// The source receiver and later declarator each evaluate once in their own position.
export function read(make) {
  const [{ at }, ...rest] = [make(() => rest), 2, 3], after = 4;
  return [at, rest, after];
}

export function readInterleaved(make) {
  const [before, { includes }, ...rest] = [2, make(() => [before, rest]), 3];
  return [before, includes, rest];
}
