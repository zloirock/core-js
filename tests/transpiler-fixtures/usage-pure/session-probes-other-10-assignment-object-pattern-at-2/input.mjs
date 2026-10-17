function eff() { return Object; }
{
let m; ({ w: { at: m } } = { w: eff() }); use(m);
}
