function eff() { return Object; }
{
try { throw { w: Array }; } catch ({ [(eff('k'), 'w')]: { from: f } }) { f; }
}
