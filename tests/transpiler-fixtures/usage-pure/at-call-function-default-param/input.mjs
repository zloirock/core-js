// A receiver memo in a parameter default belongs to that default evaluation.
// The function body cannot declare a var visible from the parameter list.
function f(x = [1].at(0)) { return x; }
