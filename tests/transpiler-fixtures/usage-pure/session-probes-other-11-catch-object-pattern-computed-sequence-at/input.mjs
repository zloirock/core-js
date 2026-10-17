const k = 'k';
{
var t = 0, { [(k++, 'at')]: a } = [1];
}
function eff() { return Object; }
{
try { throw { w: [1] }; } catch ({ [(eff('k'), 'w')]: { at: a } }) { a; }
}
