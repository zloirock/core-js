// the deoptionalize-needle comment skip must terminate cleanly when a `//` line comment
// runs to EOF without a trailing newline. the indexOf walk for newline returns -1 in
// that case and the helper returns src.length so `?.` classification falls through.
// distinct methods on each line: at / endsWith
const a = arr?. // hint at
at(0);
const b = str?. // hint endsWith
endsWith('x');
