// comments inside an argument list survive the instance dispatch, but they never make the list
// non-empty: arity comes from the AST, so a list holding nothing but a comment is a ZERO-arg call
// and gets no separator after the receiver. treating the comment as the arity signal once
// emitted `.call(arr, /* hint */)` - a trailing comma,
// and a parse error for the whole module on the ES5 baseline this method targets.
arr.includes(/* needle */ x);
arr.flat(/* hint */);
arr.findLast(x /* trailing */);
