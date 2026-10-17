const k = 'k';
function eff() { return Object; }
{
const k = 'w'; let m; ({ [k]: { at: m } } = { w: eff() }); use(m);
}
