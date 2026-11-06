import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
export function crossCaseWrite(cond, mk) {
  let P = Object;
  switch (cond) {
    case 1:
      const P = mk();
      break;
    default:
      P = mk();
  }
  return _Object$fromEntries([["a", 1]]);
}