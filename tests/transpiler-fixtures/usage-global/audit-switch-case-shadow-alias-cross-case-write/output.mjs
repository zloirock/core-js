import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
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