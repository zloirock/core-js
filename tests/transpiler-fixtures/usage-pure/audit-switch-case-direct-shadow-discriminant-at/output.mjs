import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// NESTED switches: the outer discriminant still reads the OUTER binding, while the inner
// discriminant sits INSIDE the outer case region and legitimately sees its case-direct
// lexical - the position-aware walk distinguishes the two regions
let n = "abc";
switch (_atMaybeString(n).call(n, 0)) {
  case "a":
    let n = [9];
    switch (_atMaybeArray(n).call(n, 0)) {
      case 9:
        let n2 = 0;
        break;
    }
    break;
}
export { n };