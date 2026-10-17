// the TYPE channel reads the OUTER binding for the discriminant too: the case-local array
// must not narrow the outer string (a wrong type-specific dispatcher), nor drop to generic -
// the outer binding's own narrow survives
let s = "abc";
switch (s.includes("a")) {
  case true:
    let s = [1, 2, 3];
    break;
}
export { s };
