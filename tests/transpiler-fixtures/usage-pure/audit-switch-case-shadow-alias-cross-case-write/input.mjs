export function crossCaseWrite(cond, mk) {
  let P = Object;
  switch (cond) {
    case 1:
      const P = mk();
      break;
    default:
      P = mk();
  }
  return P.fromEntries([["a", 1]]);
}
