function eff() { return Object; }
{
try { throw 0; } catch ({ [(eff('k'), 'Array')]: { from: f } = globalThis }) { f; }
}
