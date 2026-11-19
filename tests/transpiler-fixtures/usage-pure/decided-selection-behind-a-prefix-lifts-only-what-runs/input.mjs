// a destructure consuming a selection the build decides behind an effect prefix keeps only what runs of it: the
// prefix and the live arm's own effects, never a read of the constructor the claim folded - in a declaration and in
// an assignment alike
const { groupBy } = (eff('a'), typeof Symbol != 'undefined' ? (eff('b'), Map) : Object);
let from;
({ from } = (eff('c'), typeof Symbol != 'undefined' ? (eff('d'), Array) : Iterator));
export { groupBy, from };
