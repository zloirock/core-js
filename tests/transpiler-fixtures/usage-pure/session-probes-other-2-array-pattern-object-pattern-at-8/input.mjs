function eff() { return Object; }
function eff2() {}
{
const [{ w: { at: m } }] = [{ w: eff() }, eff2()]; use(m);
}
