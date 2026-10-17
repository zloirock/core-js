function eff() { return Object; }
function eff2() {}
{
const [{ at: m }] = [eff(), eff2()], z = 1; use(m, z);
}
