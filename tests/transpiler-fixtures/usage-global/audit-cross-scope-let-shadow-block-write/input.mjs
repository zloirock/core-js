// the inner block's `let K` is a DISTINCT binding shadowing the outer K, so its reassignment is not a
// reassignment of the outer K. the outer K holds 'from' throughout, so the closure dispatch injects
// es.array.from alone; attributing the shadowed inner write would wrongly add es.array.of
let K = 'from';
{
  let K = 'isArray';
  K = 'of';
}
const f = () => Array[K]([1, 2, 3]);
f();
