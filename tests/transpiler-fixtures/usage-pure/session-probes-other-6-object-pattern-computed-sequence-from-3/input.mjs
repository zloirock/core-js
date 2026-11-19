// An effectful constructor hop under a literal wrapper keeps its native from read and key evaluation.
function eff() { return Object; }
{
const { a: { [(eff('k'), 'Array')]: { from: f14 } } } = { a: globalThis };
}
