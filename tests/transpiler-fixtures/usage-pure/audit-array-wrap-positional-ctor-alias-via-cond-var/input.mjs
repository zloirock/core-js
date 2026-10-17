function condVar(c) {
  if (c) { var [{ Iterator: CB }] = [globalThis]; }
  return CB && CB.range(0, c);
}
export const viaCondVar = condVar(cond);
