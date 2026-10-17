// NESTED switches: the outer discriminant still reads the OUTER binding, while the inner
// discriminant sits INSIDE the outer case region and legitimately sees its case-direct
// lexical - the position-aware walk distinguishes the two regions
let n = "abc";
switch (n.at(0)) {
  case "a":
    let n = [9];
    switch (n.at(0)) {
      case 9:
        let n2 = 0;
        break;
    }
    break;
}
export { n };
