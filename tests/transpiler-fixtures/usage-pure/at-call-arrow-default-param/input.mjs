// A receiver memo in an arrow parameter default belongs to that default evaluation.
// The function body cannot declare a var visible from the parameter list.
const f = (x = [1].at(0)) => x;
